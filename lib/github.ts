import { Octokit } from "@octokit/rest";

// Initialize Octokit with user's access token
const getOctokit = (accessToken: string) => new Octokit({ auth: accessToken });

export async function forkRepository(
    accessToken: string,
    owner: string,
    repo: string,
    newName?: string
) {
    const octokit = getOctokit(accessToken);

    try {
        const response = await octokit.repos.createFork({
            owner,
            repo,
        });

        // Optionally rename the forked repo
        if (newName && newName !== repo) {
            await octokit.repos.update({
                owner: response.data.owner.login,
                repo: response.data.name,
                name: newName,
            });
        }

        return response.data;
    } catch (error) {
        console.error("Error forking repo:", error);
        throw error;
    }
}

export async function createRepoFromTemplate(
    accessToken: string,
    templateOwner: string,
    templateRepo: string,
    newRepoName: string,
    description?: string
) {
    const octokit = getOctokit(accessToken);

    try {
        const response = await octokit.repos.createUsingTemplate({
            template_owner: templateOwner,
            template_repo: templateRepo,
            name: newRepoName,
            description: description || "Created via School Breeze",
            private: false,
            include_all_branches: false,
        });
        return response.data;
    } catch (error) {
        console.error("Error creating repo:", error);
        throw error;
    }
}

export async function getUser(accessToken: string) {
    const octokit = getOctokit(accessToken);
    const { data } = await octokit.users.getAuthenticated();
    return data;
}

export async function getRepository(accessToken: string, owner: string, repo: string) {
    const octokit = getOctokit(accessToken);
    try {
        const { data } = await octokit.repos.get({ owner, repo });
        return data;
    } catch (error) {
        console.error("Error getting repository:", error);
        throw error;
    }
}
