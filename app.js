/*

How to use --> install following modules and update your values on variables given below

1.npm install request
2.npm install nodemailer
3.npm install sound-play

hope you like it enjoy 👍

*/

'use strict';

const pin_code = "111111" //Enter your city pincode
const day = 0 // Enter 0 for today , 1 for tomarrow and so on....
const email = 'your-email@gmail.com'; //Enter your gmail id here
const emailPass = 'your-password'; //Enter your gmail password here and make sure 2 factor authentication is off and less secure apps are allowed in your gmail account settings
const receiverEmail = ['example@gmail.com', 'friends-email-example@gmail.com', 'dad-email@gmail.com'] //Enter receivers email here you can add multiple email seperated by commas

const nodemailer = require('nodemailer');
const request = require('request')
const sound = require('sound-play')
const soundPath = require('path').dirname(require.main.filename)
let nextSevenDate;
let newDate;
const arr = []

const playSound = () => sound.play(soundPath + '\\notification.mp3')

function today() {
    function pad2(n) {
        return (n < 10 ? '0' : '') + n;
    }
    let date = new Date();
    let month = pad2(date.getMonth() + 1);//months (0-11)
    let day = pad2(date.getDate());//day (1-31)
    let year = date.getFullYear();

    let formattedDate = day + "-" + month + "-" + year;
    return [formattedDate, day, month, year]
}

function emailSender(to, content, user, pass) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });

    const mailOptions = {
        from: email,
        to: to,
        subject: 'Vaccination Slot Open',
        html: content
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
function makeData(data) {
    const center = data.center_name
    const address = data.center_address
    const capacity = data.vaccine_capacity
    const vaccine = data.vaccine
    const date = data.date
    const slots = data.slots

    const Data = {
        Center: `${center}`,
        address: `${address}`,
        capacity: `${capacity}`,
        vaccine: `${vaccine}`,
        date: `${date}`,
        slots: `${slots}`
    }
    return Data
}

const reqSite = function () {
    nextSevenDate = Number(today()[1]) + day
    newDate = `${String(nextSevenDate)}-${today()[2]}-${today()[3]}`

    const url = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByPin?pincode=${pin_code}&date=${newDate}`

    request(url, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const data = JSON.parse(body)

            for (let i = 0; i < data.centers.length; i++) {

                if (data.centers[i].sessions[0].min_age_limit < 45 && data.centers[i].sessions[0].available_capacity > 0) {

                    let outputData = { "center_name": data.centers[i].name, "center_address": data.centers[i].address, "vaccine_capacity": data.centers[i].sessions[0].available_capacity, "vaccine": data.centers[i].sessions[0].vaccine, "date": data.centers[i].sessions[0].date, "slots": data.centers[i].sessions[0].slots }
                    const finalData = makeData(outputData)
                    arr.push(finalData, "<br>")
                }
            }
        } else {
            console.log("Got an error: ", error, ", status code: ", response.statusCode)
        }
    })

    return arr
}

function repeat() {

    console.log("Requesting....")

    if (reqSite().length === 0) {
        console.log('no data found');
    } else {
        console.log('data found');
        console.log(reqSite());
        for (let i = 0; i < receiverEmail.length; i++) {
            let to = receiverEmail[i]
            emailSender(to, JSON.stringify(reqSite()), email, emailPass)
        }
        clearInterval(interval)
        setInterval(playSound, 2000)
    }

}

const interval = setInterval(repeat, 5000);

