const axios = require("axios");
const index = require("./index.json");

const prefix = "!tafseer";

function getMessage(msg) {
    if (!msg.content.toLowerCase().startsWith(prefix)) return;
    command = msg.content.toLowerCase().slice(prefix.length).trim().split(" ");
    if (command.length === 1 && (command[0] === 'help' || command[0] === '')) {
        return msg.channel.send("1. \`!tafseer #SuraID\` / Get Sura number\n2. \`!tafseer Suwar\` / Index of Suwar\n3. \`!tafseer #SuraID #AyaID\` / Tafseer Aya");
    }
    if (command.length === 1 && command[0].match('suwar')) {
        return msg.channel.send(getSuraList());
    }


    var suraName = command[0];
    var suraId = checkSura(suraName);
    if (suraId === false) return msg.channel.send("INVALID: Sura name/ID.");

    if (command.length === 1) {
        return getSura(suraId).then(data => msg.channel.send(`Sura: '${data}'`));
    }

    if (command.length === 2) {
        var ayaName = command[1];
        var ayaId = checkAya(ayaName);
        if (ayaId === false) return msg.channel.send("INVALID: Aya number.");
        var ayaText, tafseer, sura;

        getTafseer(suraId, ayaId)
        .then(data => {
            tafseer = data.text;

            getAya(data.ayah_url)
            .then(ayaData => {
                ayaText = ayaData.text; 
                sura = ayaData.sura_name;
            })
            .then(() => {
                msg.channel.send(`Sura (${suraId}): '${sura}'\nAya (${ayaId}): '${ayaText}'\nTafseer: '${tafseer}'`);
            })
        })
        return;
    }

    return msg.channel.send("INVALID: Parameters - Type \`!tafseer help\` for all commands")
};

const getSura = async (id) => {
    try {
        const res = await axios.get(
            `http://api.quran-tafseer.com/quran/${id}/1`
        );
        return res.data.sura_name;
    } catch (err) {
        console.log(err);
    }
};

function getSuraList() {
    var list = '';
    index.array.forEach(sura => {
        list+= `${sura.index} - '${sura.name}'\n`
    })

    return list
}

const getAya = async (url) => {
    try {
        const res = await axios.get(
            `http://api.quran-tafseer.com${url}`
        );
        return res.data
    } catch (err) {
        console.log(err);
    }
};

const getTafseer = async (suraId, ayaId) => {
    try {
        const res = await axios.get(
            `http://api.quran-tafseer.com/tafseer/1/${suraId}/${ayaId}`
        );
        return res.data
    } catch (err) {
        console.log(err);
    }
};

// ------------------------- TODO: Helper Functions -------------------------

function checkSura(id) {
    if (!isNaN(parseInt(id))) return id.toString();
    return getSuraKey(index.array, id);
}

function checkAya(id) {
    if (!isNaN(parseInt(id))) return id.toString();
    return false;
}

function getSuraKey(array, value) {
    array.forEach((object) => {
        if (value === object.name) {
            return object.index;
        }
    });
    return false;
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

module.exports = {
    getMessage,
};
