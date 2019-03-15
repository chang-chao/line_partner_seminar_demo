
const clova = require('@line/clova-cek-sdk-nodejs');
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require("node-fetch");

const { APIURL, APIKEY } = require('./config.js');

const clovaSkillHandler = clova.Client
    .configureSkill()
    .onLaunchRequest(async responseHelper => {
        // LaunchRequest：スキル起動直後の処理
        // データAPIサーバから質問件数を取得する
        var response = await fetch(APIURL + "count", {
            headers: { 'api-key': APIKEY },
        });
        var questionCount = await response.json();

        // Speech：Clovaが喋る内容です。
        var speech = `アンケート読み上げスキル、ようこそ。${questionCount.count}件質問をいただいております、聞きたい質問番号を選んでください`;
        responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText(speech));

        //reprompt:ユーザーが数秒間(6秒程度)応答がなかった時に再度Clovaが喋る内容です
        responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText("聞きたい質問番号を選んでください"), true);
    })
    .onIntentRequest(async responseHelper => {
        console.log("request:" + JSON.stringify(responseHelper.requestObject));
        // ユーザの発話に対するINTENTを取得する
        var intent = responseHelper.getIntentName();
        switch (intent) {
            // 質問番号を指定するINTENTの処理
            case 'ChooseByNum':
                // SLOTからユーザから指定した質問番号を取得
                var questionNum = parseInt(responseHelper.getSlot('num'), 10);
                // DATA APIサーバから指定した番号の質問情報を取得
                var response = await fetch(APIURL + questionNum, {
                    headers: { 'api-key': APIKEY },
                });
                var questionData = await response.json();
                //取得した質問を読む
                await readQuesiton(responseHelper, questionData);
                break;

            // 次の質問を読むINTENTの処理
            case 'Next':
                // セッションから現在進行中の質問番号を取得する
                var currentQuestionNum = responseHelper.getSessionAttributes().num;
                var url = APIURL + "next";
                if (currentQuestionNum != "undefined") {
                    url += "?currentNum=" + currentQuestionNum;
                }
                // データAPIサーバから次の質問を取得する
                var response = await fetch(url, {
                    headers: { 'api-key': APIKEY },
                });
                var questionData = await response.json();

                //取得した質問を読む
                await readQuesiton(responseHelper, questionData);
                break;

            // スキルを終了するINTENTの処理
            case 'Bye':
                // 終了時の発話
                responseHelper.setSimpleSpeech(
                    clova.SpeechBuilder.createSpeechText('はい、ありがとう')
                );
                //自らセッションを終了する
                responseHelper.endSession();
                break;

            // Intentに登録されていないユーザ発話を受けた場合の処理
            case 'Clova.GuideIntent':
                // 使い方を案内する
                responseHelper.setSimpleSpeech(
                    clova.SpeechBuilder.createSpeechText('聞き取れませんでした、聞きたい質問の番号を指定してください。'
                        + 'または {[100]}、つぎ {[100]}、を言って、次の質問を読み上げます。')
                );
                break;
        }
        console.log("response:" + JSON.stringify(responseHelper.responseObject));
    })
    .onSessionEndedRequest(responseHelper => {
        // セッション終了時に必要な処理はここに入れる
    })
    .handle();

async function readQuesiton(responseHelper, questionData) {
    if (isEmpty(questionData)) {
        // 指定した質問データが存在しない場合
        responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText("指定した質問がありません、別の番号を指定してください"));
    } else {
        // 指定した質問データが存在する場合
        // Speech:質問内容を読む
        responseHelper.setSpeechList([
            clova.SpeechBuilder.createSpeechText(`${questionData.orderInSeminar}番目の質問を読みます`),
            clova.SpeechBuilder.createSpeechText(questionData.content),
            clova.SpeechBuilder.createSpeechText(` {[500]}、${questionData.orderInSeminar}番目の質問内容は以上です。`)
        ]);

        // 現在進行中の質問番号をセッションに設定する
        responseHelper.setSessionAttributes({ num: questionData.orderInSeminar });
    }

    //reprompt：ユーザーが数秒間(6秒程度)応答がなかった時に再度Clovaが喋る内容です
    responseHelper.setSimpleSpeech(clova.SpeechBuilder.createSpeechText("聞きたい質問番号を選んでください"), true);

}


async function start() {
    const app = new express();
    app.post('/clova', bodyParser.json(), clovaSkillHandler);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server running on ${port}`);
    });
}

start();

function isEmpty(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key))
            return false;
    }
    return true;
}