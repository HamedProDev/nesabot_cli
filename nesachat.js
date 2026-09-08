import {configuration, OpenAIApi } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const main = async()=>{
const  chatCompletion = await openai.createChatCompletion({
    model:'gpt-3.5-turbo',
    message:[{
        role:'user',  content:'What is the capital of Rwanda'}
    ]
})
console.log(chatCompletion.data.choices[0]);

}

main();