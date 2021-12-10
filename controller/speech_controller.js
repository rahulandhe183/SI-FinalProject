const express = require('express')
const Router = express.Router();

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const { Buffer } = require('buffer');
const { PassThrough } = require('stream');
const fs = require('fs');

// Route: /auth/Text2speech
class TextTospeech {
    constructor() {
        this.response = {
            message: "ok"
        }
        this.status = 200

        // iniitalize the router
        Router.get('/', this.Get);

    }


    // Get method
    Get = async (req, res) => {
        try {

            // check the required fields
            if (!req.query.text) {
                this.status = 400
                this.response.message = "text is required"
                this.writeResponse(res)
            }

            // connect the file path and text to Azure text to speech service
            // load Azure required params from .env file
            const audioStream = await this.textToSpeech('0058a8150c3545888544bac4f6056db0', 'eastus', req.query.text);
            res.set({
                'Content-Type': 'audio/mpeg',
                'Transfer-Encoding': 'chunked'
            });

            // stream audio came from azure service
            audioStream.pipe(res);

        } catch (err) {
            // error handeling
            this.response.message = err.message
            this.status = 500
            this.writeResponse(res)
        }
    }

    writeResponse = (res) => {
        res.status(this.status).json(this.response);
    }



    // connect the file path and text to Azure text to speech service
    textToSpeech = async (key, region, text) => {
        // convert callback function to promise
        return new Promise((resolve, reject) => {
            const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
            speechConfig.speechSynthesisOutputFormat = 5; // mp3

            let audioConfig = null;


            const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
            synthesizer.speakTextAsync(
                text,
                result => {
                    const { audioData } = result;
                    synthesizer.close();

                    // return stream from memory
                    const bufferStream = new PassThrough();
                    bufferStream.end(Buffer.from(audioData));
                    resolve(bufferStream);
                },
                error => {
                    synthesizer.close();
                    reject(error);
                });
        });
    };

}

new TextTospeech();
module.exports = Router;