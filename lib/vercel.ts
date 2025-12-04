import axios from "axios";

const VERCEL_API_URL = "https://api.vercel.com";

// Get Vercel client with token
const getVercelClient = (token: string) => axios.create({
    baseURL: VERCEL_API_URL,
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

export async function createVercelProject(
    token: string,
    projectName: string,
    gitRepo: { type: "github"; repo: string }
) {
    const client = getVercelClient(token);

    try {
        const response = await client.post("/v9/projects", {
            name: projectName,
            framework: "nextjs",
            gitRepository: gitRepo,
            buildCommand: "npm run build",
            devCommand: "npm run dev",
            installCommand: "npm install",
        });
        return response.data;
    } catch (error) {
        console.error("Error creating Vercel project:", error);
        throw error;
    }
}

export async function setEnvironmentVariables(
    token: string,
    projectId: string,
    envVars: Array<{ key: string; value: string; target: string[] }>
) {
    const client = getVercelClient(token);

    try {
        const promises = envVars.map((envVar) =>
            client.post(`/v10/projects/${projectId}/env`, {
                key: envVar.key,
                value: envVar.value,
                target: envVar.target,
                type: "encrypted",
            })
        );
        await Promise.all(promises);
    } catch (error) {
        console.error("Error setting environment variables:", error);
        throw error;
    }
}

export async function triggerDeployment(
    token: string,
    projectName: string,
    gitBranch: string = "main"
) {
    const client = getVercelClient(token);

    try {
        const response = await client.post("/v13/deployments", {
            name: projectName,
            gitSource: {
                type: "github",
                ref: gitBranch,
                repoId: projectName,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error triggering deployment:", error);
        throw error;
    }
}

export async function getDeploymentStatus(token: string, deploymentId: string) {
    const client = getVercelClient(token);

    try {
        const response = await client.get(`/v13/deployments/${deploymentId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting deployment status:", error);
        throw error;
    }
}
