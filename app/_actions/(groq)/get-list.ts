"use server"

import Groq from "groq-sdk"

export default async function getListGroqAi() {
    const groq = new Groq({
        apiKey: "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",
    })

    const models = await groq.models.list();

    console.log(models)
    return models;
}