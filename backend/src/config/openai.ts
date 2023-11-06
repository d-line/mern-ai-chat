import Configuration from "openai";

export const configureOpenAI = () => {
    const config = new Configuration({
        organization: process.env.OPENAI_ORGANIZATION,
        apiKey: process.env.OPENAI_SECRET
    });
    return config;
}