import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCbQxY3is0FiKaOGlN0Pm8BlrN4z7Ig6Vo");
console.log(`process.env.GEMINI_API_KEY : ${process.env.GEMINI_API_KEY}`)

export const askGemini = async (msgs) => {
    const model = genAI.getGenerativeModel({
        model:"gemini-1.5-flash"
    })

    const prompt = `Your given a conversation of a group chat. Each message is of the format,
    'user' property contains particular user info and 'content' information contains the message of that user.
    your supposed to understand the whole conversation and answer to the specific question which is asked by user.
    The last Message specifying or containing @ai in the given content are supposed to be answered by you!
    Understand the chat and taking it as the base knowledge answer from your knowledge and the chat.
    Here is the full conversation : ${msgs}
    Conversation ends!
    Remember your in a conversation with human, So answer like human friendly answers`;

    const result = await model.generateContent(prompt)
    // console.log(`Result : ${result}`)
    const response = await result.response;
    // console.log(`response : ${response}`)
    const text = response.text();
    // console.log(`text : ${text}`)
    // console.log(text)
    return text
}