const { Languages, Requests, User, Services } = require('../models');
const { languagesDefault, requestsDefault, usersDefault, servicesDefault } = require('./dbDefaultValue');


function languages(){
    Languages.find({})
        .then(languages => {
            if(!languages.length){
                for(const lang of languagesDefault){
                    new Languages(lang).save()
                        .then((lang) => {
                            console.log(`Lang: ${lang.lang} was save!`)
                        })
                        .catch((err) => {
                            console.log(`Lang: ${lang.lang} wasn't save. Because of ${err.message}`)
                        });
                }

            }
        })
        .catch(err => {
            console.log(err)
        })
}

function requests(){
    Requests.find({})
        .then(requests => {
            if(!requests.length){
                for(const req of requestsDefault){
                    new Requests(req).save()
                        .then((lang) => {
                            console.log(`Request: with name ${req.contactName} was save!`)
                        })
                        .catch((err) => {
                            console.log(`Request: with name ${req.contactName} wasn't save. Because of ${err.message}`)
                        });
                }

            }
        })
        .catch(err => {
            console.log(err)
        })
}

function users(){
    User.find({})
        .then(users => {
            if(!users.length){
                for(const user of usersDefault){
                    new User(user).save()
                        .then((user) => {
                            console.log(`User ${user.username} was save!`)
                        })
                        .catch((err) => {
                            console.log(`User ${user.username} wasn't save. Because of ${err.message}`)
                        });
                }

            }
        })
        .catch(err => {
            console.log(err)
        })
}

function services() {
    Services.find({})
        .then(services => {
            if(!services.length) {
                for(const service of servicesDefault) {
                    new Services(service).save()
                        .then((service) => {
                            console.log(`Service ${service.title} was saved!`)
                        })
                        .catch((err) => {
                            console.log(`Service ${service.title} wasn't saved. Because of ${err.message}`)
                        });
                }
            }
        })
}
async function checkCollections(){
    await languages();
    await requests();
    await users();
    await services();
}

module.exports = checkCollections();
