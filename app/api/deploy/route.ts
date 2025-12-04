import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { forkRepository } from '@/lib/github';
import { createVercelProject, setEnvironmentVariables } from '@/lib/vercel';
import { createClient } from '@supabase/supabase-js';
import { decrypt } from '@/lib/crypto';

/**
 * 원클릭 배포(One-Click Deploy) API Endpoint
 * 
 * 이 API는 다음 과정을 자동으로 처리합니다:
 * 1. 사용자의 GitHub 권한 확인
 * 2. 저장된 API 키 불러오기 (프로필에서)
 * 3. 템플릿 저장소를 사용자 계정으로 Fork
 * 4. Vercel에 프로젝트 생성
 * 5. 환경 변수(API 키 등) 설정
 * 6. 자동 배포
 */
export async function POST(request: Request) {
    try {
        // ==============================================
        // 1단계: 사용자 인증 확인
        // ==============================================
        const session = await auth();

        if (!session?.accessToken) {
            return NextResponse.json(
                { error: '로그인이 필요합니다. GitHub 계정으로 로그인해주세요.' },
                { status: 401 }
            );
        }

        // ==============================================
        // 2단계: 요청 데이터 파싱
        // ==============================================
        const body = await request.json();
        const {
            templateRepo,  // 복제할 템플릿 저장소 (예: "owner/repo-name")
            repoName,      // 새로 만들 저장소 이름
        } = body;

        // 요청에서 받은 API 키들 (모달에서 입력한 값)
        let {
            geminiApiKey,
            supabaseUrl,
            supabaseKey,
            vercelToken
        } = body;

        // ==============================================
        // 3단계: 저장된 API 키 불러오기
        // ==============================================
        const supabaseUrl_env = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey_env = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl_env, supabaseKey_env);

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', session.user?.email)
            .single();

        // 저장된 값이 있으면 사용 (요청에서 받은 값이 없을 때만)
        if (!vercelToken && profile?.vercel_access_token) {
            try {
                vercelToken = decrypt(profile.vercel_access_token);
                console.log('✓ 저장된 Vercel 토큰을 복호화하여 사용합니다.');
            } catch (e) {
                console.error('Vercel 토큰 복호화 실패:', e);
            }
        }

        if (!geminiApiKey && profile?.gemini_api_key) {
            geminiApiKey = profile.gemini_api_key;
            console.log('✓ 저장된 Gemini API 키를 사용합니다.');
        }

        if (!supabaseUrl && profile?.supabase_url) {
            supabaseUrl = profile.supabase_url;
            console.log('✓ 저장된 Supabase URL을 사용합니다.');
        }

        if (!supabaseKey && profile?.supabase_anon_key) {
            supabaseKey = profile.supabase_anon_key;
            console.log('✓ 저장된 Supabase Key를 사용합니다.');
        }

        // GitHub 토큰 처리
        let githubToken = session.accessToken;
        if (profile?.github_access_token) {
            try {
                githubToken = decrypt(profile.github_access_token);
                console.log('✓ 저장된 GitHub 토큰을 복호화하여 사용합니다.');
            } catch (e) {
                console.error('GitHub 토큰 복호화 실패:', e);
            }
        }

        // ==============================================
        // 4단계: 입력 값 검증
        // ==============================================
        if (!repoName || !templateRepo) {
            return NextResponse.json(
                { error: '저장소 이름과 템플릿이 필요합니다.' },
                { status: 400 }
            );
        }

        // 템플릿 저장소 형식 확인 (예: "owner/repo-name")
        const [owner, repo] = templateRepo.split('/');
        if (!owner || !repo) {
            return NextResponse.json(
                { error: '템플릿 저장소 형식이 올바르지 않습니다. (예: owner/repo-name)' },
                { status: 400 }
            );
        }

        // ==============================================
        // 5단계: GitHub 저장소 Fork (복제)
        // ==============================================
        console.log('📦 GitHub 저장소 복제 시작:', templateRepo);

        const forkedRepo = await forkRepository(
            githubToken,
            owner,
            repo,
            repoName
        );

        console.log('✓ 저장소 복제 완료:', forkedRepo.html_url);

        // ==============================================
        // 6단계: Vercel 배포 (선택적)
        // ==============================================
        let deployment = null;

        if (vercelToken) {
            console.log('🚀 Vercel 배포 시작...');

            // GitHub Fork가 완전히 완료될 때까지 잠시 대기
            await new Promise(resolve => setTimeout(resolve, 3000));

            try {
                // Vercel 프로젝트 생성
                const project = await createVercelProject(
                    vercelToken,
                    repoName,
                    {
                        type: 'github',
                        repo: forkedRepo.full_name,
                    }
                );

                console.log('✓ Vercel 프로젝트 생성 완료:', project.id);

                // ==============================================
                // 7단계: 환경 변수 설정 (API 키 주입)
                // ==============================================
                const envVars = [];

                if (geminiApiKey) {
                    envVars.push({
                        key: 'GOOGLE_GEMINI_API_KEY',
                        value: geminiApiKey,
                        target: ['production', 'preview', 'development']
                    });
                }

                if (supabaseUrl) {
                    envVars.push({
                        key: 'NEXT_PUBLIC_SUPABASE_URL',
                        value: supabaseUrl,
                        target: ['production', 'preview', 'development']
                    });
                }

                if (supabaseKey) {
                    envVars.push({
                        key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
                        value: supabaseKey,
                        target: ['production', 'preview', 'development']
                    });
                }

                if (envVars.length > 0) {
                    console.log(`🔑 환경 변수 ${envVars.length}개 설정 중...`);
                    await setEnvironmentVariables(vercelToken, project.id, envVars);
                    console.log('✓ 환경 변수 설정 완료');
                }

                deployment = project;

            } catch (vercelError) {
                console.error('❌ Vercel 배포 실패:', vercelError);
            }
        }

        // ==============================================
        // 8단계: 배포 기록 저장 (DB)
        // ==============================================
        const deploymentUrl = deployment?.link?.url
            ? `https://${deployment.link.url}` // Vercel 배포 URL
            : `https://vercel.com/new/clone?repository-url=${forkedRepo.html_url}`; // 수동 배포 링크

        try {
            const { error: insertError } = await supabase
                .from('user_deployments')
                .insert({
                    user_id: session.user.id,
                    template_id: body.templateId || null, // 템플릿 ID (선택)
                    repo_name: repoName,
                    repo_url: forkedRepo.html_url,
                    deployment_url: deploymentUrl
                });

            if (insertError) {
                console.error('⚠️ 배포 기록 저장 실패:', insertError);
                // 배포는 성공했으므로 에러를 던지지는 않음
            } else {
                console.log('✓ 배포 기록 저장 완료');
            }
        } catch (dbError) {
            console.error('⚠️ DB 저장 중 오류:', dbError);
        }

        // ==============================================
        // 9단계: 결과 반환
        // ==============================================
        return NextResponse.json({
            success: true,
            repoUrl: forkedRepo.html_url,
            deploymentUrl: deploymentUrl,
            message: deployment
                ? '🎉 저장소 복제 및 배포 완료!'
                : '✓ 저장소 복제 완료! Vercel에서 수동으로 배포할 수 있습니다.',
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('배포 오류:', error);

        if (error.status === 403) {
            return NextResponse.json(
                { error: 'GitHub 권한이 없습니다. GitHub 로그인 시 저장소 권한을 부여해주세요.' },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { error: error.message || '배포에 실패했습니다. 다시 시도해주세요.' },
            { status: 500 }
        );
    }
}
