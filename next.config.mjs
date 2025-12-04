/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Warning: This allows production builds to successfully complete even if
        // your project has ESLint errors.
        ignoreDuringBuilds: true,
    },
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    webpack: (config, { isServer }) => {
        // Fix for chrome-aws-lambda
        if (isServer) {
            config.externals.push('chrome-aws-lambda');
        }

        // Ignore .js.map files from chrome-aws-lambda
        config.module.rules.push({
            test: /\.js\.map$/,
            loader: 'ignore-loader'
        });

        return config;
    },
};

export default nextConfig;
