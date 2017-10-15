<template>
    <div>
        <h1>Ma liste de liens</h1>
        <hr>

        <div class="panel panel-default">
            <div class="panel-heading">
                <a href="#" @click.prevent="newLink.open = !newLink.open">Ajouter un nouveau lien</a>
                <button class="btn btn-xs btn-default pull-right" @click.prevent="changeVersion()" v-if="!adminVersion">
                    Afficher la version admin
                </button>
                <button class="btn btn-xs btn-default pull-right" @click.prevent="changeVersion()" v-if="adminVersion">
                    Cacher la version admin
                </button>
            </div>
            <transition name="fade">
                <div class="panel-body" v-if="newLink.open">
                    <label for="newLinkCategory">Catégorie :</label>
                    <div class="input-group" v-if="!newCategory.show">
                        <select id="newLinkCategory" class="form-control" v-model="newLink.category">
                            <option v-if="links.length != 0" :value="null">Choissiez une catégorie</option>
                            <option v-for="(category, index) in searchCategories()" :value="category" :key="true">
                                {{ category }}
                            </option>
                            <option v-if="links.length === 0" :value="null">Aucune catégorie disponible...</option>
                        </select>
                        <span class="input-group-btn">
                        <button class="btn btn-default" @click.prevent="newCategory.show = !newCategory.show">Nouvelle catégorie</button>
                    </span>
                    </div>
                    <div class="input-group" v-if="newCategory.show">
                        <input v-model="newCategory.name" type="text" class="form-control" placeholder="Nouvelle catégorie | Ex: Graphisme">
                        <span class="input-group-btn">
                        <button class="btn btn-default" @click.prevent="addCategory()">Ajouter</button>
                        <button class="btn btn-default" @click.prevent="newCategory.show = !newCategory.show">Annuler</button>
                    </span>
                    </div>
                    <hr>
                    <div class="form-group">
                        <label for="newLinkName">Nom du nouveau lien :</label>
                        <input id="newLinkName" type="text" v-model="newLink.name" class="form-control" placeholder="Ex: Mon lien">
                    </div>
                    <div class="form-group">
                        <label for="newLinkLink">Lien correspondant :</label>
                        <input id="newLinkLink" type="text" v-model="newLink.url" class="form-control" placeholder="Ex: https://exemple.fr">
                    </div>
                    <div class="form-group">
                        <label for="newLinkDescription">Courte description :</label>
                        <input id="newLinkDescription" type="text" v-model="newLink.description" class="form-control" placeholder="Ex: Superbe album photo en ligne">
                    </div>
                    <button class="btn btn-default" @click.prevent="addLink()">Ajouter ce lien</button>
                    <button class="btn btn-default" @click.prevent="newLink.open = !newLink.open">Annuler</button>
                </div>
            </transition>
        </div>

        <transition name="fade">
            <div class="alert alert-warning" v-if="errors.length != 0">
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </div>
        </transition>

        <transition name="fade">
            <div class="alert alert-warning" v-if="confirmAlert">
                Confirmez-vous la suppression de la catégorie "{{ confirmElement }}" ?
                <hr>
                <button class="btn btn-sm btn-warning" @click.prevent="deleteCategory()">Confirmer</button>
                <button class="btn btn-sm btn-default" @click.prevent="confirmAlert = false">Annuler</button>
            </div>
        </transition>

        <div class="row">
            <div class="col-md-6" v-for="category in links">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        {{ category.name }}
                        <button class="btn btn-xs btn-warning pull-right" v-if="adminVersion" @click.prevent="confirmAlert = true; confirmElement = category.name">
                            Supprimer la catégorie
                        </button>
                    </div>
                    <div class="panel-body">
                        <ul>
                            <li v-for="link in category.data">
                                <a :href="link.url" target="_blank">{{ link.name }}</a>
                                <span class="text-muted" v-if="link.description != null">
                                    ( {{ link.description }} )
                                </span>
                            </li>
                            <li v-if="category.data.length === 0">Aucun lien disponible dans cette catégorie...</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="col-md-12" v-if="links.length === 0">
                <h4>Aucune catégorie de lien ne semble disponible.</h4>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'app',
        data () {
            return {
                errors: [],
                adminVersion: false,
                newCategory: {
                    show: false,
                    name: null
                },
                newLink: {
                    open: false,
                    name: null,
                    category: null,
                    url: null,
                    description: null
                },
                links: [
                    {
                        name: 'cat1',
                        data: [
                            {
                                name: 'link1',
                                url: '',
                                description: 'Ma superbe description'
                            },
                            {
                                name: 'link2',
                                url: ''
                            },
                            {
                                name: 'link3',
                                url: ''
                            }
                        ]
                    },
                    {
                        name: 'cat2',
                        data: [
                            {
                                name: 'link2',
                                url: ''
                            }
                        ]
                    }
                ],
                serverAvailable: false,
                timeout: null,
                confirmAlert: false,
                confirmElement: null
            }
        },
        mounted () {
            this.$http.get('server/server.php').then(response => {
                this.links = response.body
                this.serverAvailable = true
            }, response => {
                this.addError('Attention : le serveur de données est indisponible. Les données ne peuvent pas être sauvegardées.', 15000)
            })
        },
        methods: {
            searchCategories () {
                return this.links.map(function (link) {
                    return link.name
                })
            },
            addCategory (categoryName) {
                if (categoryName === undefined) {
                    categoryName = this.newCategory.name
                }
                if (this.checkField(categoryName)) {
                    if (!this.categoryExist(categoryName)) {
                        this.links.push({
                            name: categoryName,
                            data: []
                        })
                    }
                    this.newLink.category = categoryName
                    this.newCategory.show = false
                    this.newCategory = {
                        show: false,
                        name: null
                    }
                }
                return categoryName
            },
            deleteCategory () {
                if (this.confirmElement != null) {
                    let self = this
                    this.links = this.links.filter(function (category) {
                        return (category.name != self.confirmElement) ? category : null
                    })
                    if (this.serverAvailable) {
                        this.$http.get('server/server.php', {
                            params: {
                                deleteCategory: this.confirmElement,
                            }
                        })
                    }
                    this.confirmAlert = false
                    this.confirmElement = null
                }
            },
            categoryExist (category) {
                let catFind = false
                for (let link of this.links) {
                    if (link.name === category) {
                        catFind = true
                        break
                    }
                }
                return catFind
            },
            checkField (field) {
                return (field != null && field != '')
            },
            changeVersion () {
                this.adminVersion = !this.adminVersion;
                if (this.adminVersion) {
                    let self = this
                    this.timeout = setTimeout(function () {
                        self.adminVersion = false;
                    }, 10000)
                } else {
                    if (this.timeout != null) {
                        clearTimeout(this.timeout)
                    }
                }
            },
            addLink () {
                if (this.checkField(this.newLink.name) && this.checkField(this.newLink.url) && this.checkField(this.newLink.category)) {
                    let categoryName = this.addCategory(this.newLink.category)
                    let self = this
                    this.links.filter(function (link) {
                        if (link.name === self.newLink.category) {
                            if (!['http://', 'https:/'].includes(self.newLink.url.substring(0, 7))) {
                                self.newLink.url = 'http://' + self.newLink.url
                            }
                            let description = (self.checkField(self.newLink.description)) ? self.newLink.description : null
                            link.data.push({
                                name: self.newLink.name,
                                url: self.newLink.url,
                                description: description
                            })
                            if (self.serverAvailable) {
                                self.$http.get('server/server.php', {
                                    params: {
                                        categoryName: categoryName,
                                        linkName: self.newLink.name,
                                        linkUrl: self.newLink.url,
                                        linkDescription: description
                                    }
                                }).then(response => {
                                }, response => {
                                    self.addError('Attention : le serveur de données est indisponible. Les données ne peuvent pas être sauvegardées.', 7500)
                                })
                            }
                            self.resetFields()
                        }
                    })
                } else {
                    this.addError('Les champs "Nom du lien", "Lien correspondant" et "Catégorie" doivent êtres renseignés.', 5000)
                }
            },
            resetFields () {
                this.newLink = {
                    open: false,
                    name: null,
                    category: null,
                    url: null,
                    description: null
                }
            },
            addError (message, delay) {
                this.errors.push(message)
                let self = this
                setTimeout(function () {
                    self.errors.splice(0, self.errors.length)
                }, delay)
            }
        }
    }
</script>

<style>
    .fade-enter-active, .fade-leave-active {
        transition: opacity .2s
    }

    .fade-enter, .fade-leave-to {
        opacity: 0
    }
</style>