<template lang="pug">
    .adminportal-wrapper
        .admin-top
            .admin-top__admin-name 
                h2.adminPortal ADMIN PORTAL
            .admin-top__search-block
                .new-request
                    Button(value="Add New Project" @clicked="gotoRequestPage" customClass="main-nav_button")
                .account-menu(v-click-outside="hideAccountMenu")
                    .woman-wrapper
                        img.woman-wrapper__photo(v-if="!user.photo" src="../assets/images/client-icon_image.png")
                        img.woman-wrapper__photo(v-else :src="user.photo")
                        .account-menu-wrapper(v-if="accountMenuVisible")
                            .account-block
                                .account-block__info
                                    .icon
                                        img(src="../assets/images/man.png")
                                    .personal__data
                                        .personal__data_name {{ user.firstName }} {{ user.lastName }}
                                        .personal__data_email {{ user.email }}
                                .account-block__myaccount(@click="showAccountInfo")
                                    .human_icon
                                        img(src="../assets/images/man.png")
                                    .my_account My Account
                                .account-block__exit(@click="signOut")
                                    .icon_exit
                                        img(src="../assets/images/sign-out.png")
                                    .sign_out Sign Out
                    .chevron-wrapper
                        .chevron(@click="showAccountMenu")
        .admin-main-wrapper
            .admin-navbar
                .admin-navbar__sidebar
                    ul.navbar__menu
                        router-link(:to="note.path" v-for="(note, index) in navbarList")
                            li.navbar__menu_item(@click="switchSection(index)" :class="{active: note.active}")
                                .image(v-if="!note.active && note.imgWhite")
                                    img.image.navbar_no-filter(:src="note.imgWhite")
                                .image(v-else)
                                    img(:src="note.imgBrown")
                                .title
                                    span {{ note.title }}
                    .balloons
            .admin-main-wrapper__inner
                router-view(:isSidebar="isSidebar"
                    @refreshServices='refreshServices'
                    )
</template>

<script>
import ClickOutside from "vue-click-outside";
import { mapGetters, mapActions } from "vuex";
import Button from "./Button";

export default {
    data() {
        return {
            navbarList: [{
                    title: "DASHBOARD",
                    imgBrown: require("../assets/images/CATEGORIES/DASHBOARD.png"),
                    active: true,
                    path: "/"
                },
                {
                    title: "VENDORS",
                    imgBrown: require("../assets/images/CATEGORIES/VENDORS.png"),
                    imgWhite: require("../assets/images/CATEGORIES/VENDORS2.png"),
                    active: false,
                    path: "/vendors/active"
                },
                {
                    title: "CLIENTS",
                    imgBrown: require("../assets/images/CATEGORIES/clients.png"),
                    active: false,
                    path: "/clients/active"
                },
                {
                    title: "PROJECTS",
                    imgBrown: require("../assets/images/CATEGORIES/pm-brown.png"),
                    active: false,
                    path: "/projects/open-projects"
                },
                {
                    title: "FINANCE",
                    imgBrown: require("../assets/images/CATEGORIES/FINANCE.png"),
                    active: false,
                    path: "/finance"
                },
                {
                    title: "REPORTS",
                    imgBrown: require("../assets/images/CATEGORIES/REPORTS.png"),
                    imgWhite: require("../assets/images/CATEGORIES/REPORTS2.png"),
                    active: false,
                    path: "/reports"
                },
                {
                    title: "SETTINGS",
                    imgBrown: require("../assets/images/CATEGORIES/SETTINGS.png"),
                    active: false,
                    path: "/settings"
                }
            ],
            newProject: [{
                    title: "Translation"
                },
                {
                    title: "Copywriting"
                },
                {
                    title: "Marketing"
                },
                {
                    title: "Proofing/QA"
                },
                {
                    title: "Graphic Localization"
                }
            ],
            accountMenuVisible: false,
            quotes: [],
            path: "Language Settings",
            accountInfo: false,
            isSidebar: false,
            clientLanguages: []
        };
    },
    methods: {
        async getCurrentUserGroup() {
            try {
                if (!this.userGroup) {
                    await this.setUser();
                }
            } catch (err) {
                console.log("Cannot identify user group");
            }
        },
        async getLanguages() {
            let result = await this.$http.get('/api/languages');
            let allLangs = result.body;
            this.$store.dispatch('allLanguages', allLangs);
        },
        gotoRequestPage(index) {
            this.$router.push({name: 'create-project'});
            this.checkForSpecifiedSideBar('project', 'PROJECTS');
        },
        mainPageRender() {
            this.toggleSideBar(true);
        },
        checkForSpecifiedSideBar(address, title) {
            if (window.location.toString().indexOf(address) !== -1) {
                this.navbarList.forEach(item => {
                    item.active = item.title === title;
                })
            }
        },
        toggleSideBar(isFirstRender) {
            const location = window.location.toString();
            if (location.indexOf('project') !== -1) {
                this.checkForSpecifiedSideBar('project', 'PROJECTS');
            } else if (location.indexOf('request') !== -1) {
                this.checkForSpecifiedSideBar('request', 'PROJECTS');
            } else if (location.indexOf('client') !== -1) {
                this.checkForSpecifiedSideBar('client', 'CLIENTS');
            } else if (location.indexOf('vendor') !== -1) {
                this.checkForSpecifiedSideBar('vendor', 'VENDORS');
            }else{}
        },
        checkAddressForSideBar(isFirstRender) {
            for (let elem of this.navbarList) {
                if (window.location.toString().indexOf(elem.title.toLowerCase()) !== -1) {
                    elem.active = true;
                    if (isFirstRender) {
                        const path = '/' + elem.title.toLowerCase()
                        this.$router.push(path);
                    }
                } else {
                    elem.active = false
                }
            }
        },
        hideAccountMenu() {
            this.accountMenuVisible = false;
        },
        async signOut() {
            try {
                await this.$store.dispatch("logout");
                this.$router.push('/login');
            } catch (err) {}
        },
        switchSection(index) {
            this.navbarList.forEach((item, i) => {
                if (i == index) {
                    item.active = true;
                } else {
                    item.active = false;
                }
            })
            const title = this.navbarList[index].title;
            this.changeRoute(title);
        },
        changeRoute(title) {
            switch (title) {
                case "DASHBOARD":
                    this.$router.push('/');
                    break;
                case "VENDORS":
                    this.$router.push('/vendors');
                    break;
                case "CLIENTS":
                    this.$router.push('/clients');
                    break;
                case "PROJECTS":
                    this.$router.push('/projects/open-projects');
                    break;
                case "FINANCE":
                    this.$router.push('/finance');
                    break;
                case "REPORTS":
                    this.$router.push('/reports');
                    break;
                case "SETTINGS":
                    this.$router.push('/settings');
                    break;
            }
        },
        showAccountMenu() {
            this.accountMenuVisible = !this.accountMenuVisible;
        },
        showAccountInfo() {
            this.$router.push('/account-info');
            this.accountMenuVisible = false;
        },
        async refreshServices(data) {
            await this.getServices();
        },
        ...mapActions({
            setUser: "setUser",
            getServices: "getServices"
        })
    },
    computed: {
        ...mapGetters({
            user: "getUser",
            userGroup: "getUserGroup"
        })
    },
    components: {
        Button
    },
    beforeRouteUpdate(to, from, next) {
        if (localStorage.getItem('token')) {
            next()
        } else {
            next('/login')
        }
    },
    created() {
        this.getCurrentUserGroup();
        this.getLanguages();
    },
    mounted() {
        this.mainPageRender();
    },
    updated() {
        this.toggleSideBar(false);
    },
    directives: {
        ClickOutside
    }
};
</script>

<style lang="scss" scoped>
.admin-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: #67573e;
    position: fixed;
    height: 6vh;
    width: 100%;
    z-index: 1000;

    &__admin-name {
        width: 35%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-left: 150px;

        a {
            text-decoration: none;
            padding-top: 11px;
        }

        .adminPortal {
            color: #fff;
            width: 100%;
            font-size: 24px;
            font-family: MyriadPro;
            font-weight: 700;
        }
    }

    &__search-block {
        width: 35%;
        display: flex;
        justify-content: flex-end;
        align-items: center;

        .woman-wrapper {
            margin: 0 3px 0 15px;
            border-radius: 30px;
            width: 33px;
            height: 33px;
            position: relative;

            &__photo {
                border-radius: 50%;
                background-color: white;
                padding-bottom: 1px;
                padding-right: 1px;
                width: 35px;
                height: 35px;
                object-fit: cover;
            }

            .account-menu-wrapper {
                .account-block {
                    width: 192px;
                    height: 124px;
                    background-color: #fff;
                    box-shadow: 1px 1px 11px black;
                    position: absolute;
                    top: 44px;
                    right: -140px;
                    border-radius: 6px;
                    z-index: 5;
                    overflow: hidden;

                    &__info {
                        display: flex;
                        justify-content: flex-start;
                        border-bottom: 1px solid #998e7e;
                        padding: 5px 0;

                        .icon {
                            margin-left: 10px;

                            img {
                                height: 32px;
                            }
                        }

                        .personal__data {
                            color: #67573e;
                            display: flex;
                            flex-direction: column;
                            justify-content: flex-start;
                            align-items: flex-start;
                            padding-top: 5px;
                            margin-left: 10px;

                            &_name {
                                font-size: 12px;
                            }

                            &_email {
                                font-size: 11px;
                            }
                        }
                    }

                    &__myaccount {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        border-bottom: 1px solid #998e7e;
                        cursor: pointer;

                        .human_icon {
                            margin-left: 10px;

                            img {
                                height: 32px;
                            }
                        }

                        .my_account {
                            font-size: 12px;
                            color: #67573e;
                            margin-left: 10px;
                        }

                        &:hover {
                            background-color: #ddd3c8;
                        }
                    }

                    &__exit {
                        display: flex;
                        justify-content: flex-start;
                        align-items: center;
                        cursor: pointer;

                        .icon_exit {
                            margin-left: 10px;

                            img {
                                height: 32px;
                            }
                        }

                        .sign_out {
                            font-size: 12px;
                            color: #67573e;
                            margin-left: 7%;
                        }

                        &:hover {
                            background-color: #ddd3c8;
                        }
                    }
                }
            }
        }

        .chevron-wrapper {
            width: 140px;

            .chevron {
                position: relative;
                text-align: center;
                padding: 12px 12px 12px 12px;
                margin-bottom: 6px;
                height: 16px;
                width: 16px;
                cursor: pointer;
                transform: rotate(180deg);

                @media screen and (max-width: 1450px) {
                    margin-right: 43px;
                }

                @media screen and (max-width: 1350px) {
                    margin-right: 23px;
                }
            }

            .chevron:before {
                content: "";
                position: absolute;
                top: 15px;
                height: 8%;
                width: 29%;
                background: #fff;
                transform: skew(0deg, 50deg);
            }

            .chevron:after {
                content: "";
                position: absolute;
                top: 15px;
                height: 8%;
                left: 8px;
                width: 29%;
                background: #fff;
                transform: skew(0deg, -50deg);
            }
        }
    }
}

.admin-main-wrapper {
    box-sizing: border-box;
    padding-top: 6vh;
    display: flex;
    height: 100%;
    position: relative;
    width: 100%;

    &__inner {
        width: calc(100% - 150px);
        margin-left: 150px;
    }

    .admin-navbar {
        font-family: MyriadPro;
        position: fixed;
        left: 0;
        z-index: 999;
        display: flex;
        min-height: 94vh;

        &__sidebar {
            padding: 25px 0;
            background-color: #998e7e;
            width: 150px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            box-shadow: 1px 0px 10px #998E7E;
            transition: all 0.5s;
            z-index: 2;
            overflow: hidden;
        }

        .navbar__menu {
            list-style: none;
            font-size: 15px;
            font-weight: bold;
            padding: 0;
            width: 177px;
            height: 77vh;
            overflow-y: scroll;
            margin-bottom: 0;
            margin-left: 16px;
            a {
                text-decoration: none;
                display: block;
                margin-bottom: 20px;
            }
            &_item {
                padding-bottom: 10px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                margin-left: 0;
                margin-right: 0;
                cursor: pointer;
                transition: all 0.2s;
                &:last-child {
                    margin-bottom: 0;
                }

                .title {
                    transition: all 0.2s;
                    color: #fff;
                }

                .image {
                    img {
                        filter: brightness(300%);
                    }
                    .navbar_no-filter {
                        filter: none;
                    }
                }
            }
            .active {
                background-color: white;

                .title {
                    color: #978d7e;
                }

                .image {
                    img {
                        filter: none;
                    }
                }
            }
        }

        .balloons {
            transition: all 0.4s;
            display: flex;
            justify-content: center;
            align-items: center;
            background-image: url("../assets/images/balloons.png");
            background-repeat: no-repeat;
            background-position: center;
            width: 100%;
            height: 100px;
            box-shadow: -2px -5px 5px rgba(103, 87, 62, 0.4);
        }
    }
}

.new-request {
    height: 34px;
    width: 239px;
    margin-right: 83px;
    z-index: 3;
    position: relative;
}

.additional {
    position: absolute;
    border: 2px solid #978d7e;
    color: #67573e;
    background-color: #fff;
    font-size: 16px;
    width: 100%;
    top: 25px;
    z-index: -1;
    box-sizing: border-box;

    &__listItem {
        padding: 13px;
        font-family: MyriadPro;
        border-bottom: 0.2px solid #978d7e;
        cursor: pointer;

        &:hover {
            background-color: #ddd3c8;
        }

        &:first-child {
            padding-top: 20px;
        }
    }
}

.account-menu {
    display: flex;
    align-items: center;
}

@font-face {
    font-family: MyriadPro;
    src: url("../assets/fonts/MyriadPro-Regular.otf");
}

@font-face {
    font-family: MyriadBold;
    src: url("../assets/fonts/MyriadPro-Bold.otf");
}
</style>
