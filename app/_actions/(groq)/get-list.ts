"use server"

import Groq from "groq-sdk"
import { ModelListResponse } from "groq-sdk/resources/models.mjs";

export default async function getListGroqAi(): Promise<ModelListResponse> {
    const groq = new Groq({
        apiKey: "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",
    })

    const models = await groq.models.list();

    console.log(models)
    return models;
}