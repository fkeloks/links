<template>
    <div>
        <h1>Ma liste de liens</h1>
        <h2>L'accès à cette liste est reglementé pour des raisons de sécurité.</h2>
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
                <div v-if="confirmElement.type === 'link'">
                    Confirmez-vous la suppression du lien "{{ confirmElement.element }}" ?
                </div>
                <div v-if="confirmElement.type === 'category'">
                    Confirmez-vous la suppression de la catégorie "{{ confirmElement.element }}" ?
                </div>
                <hr>
                <button class="btn btn-sm btn-warning" @click.prevent="confirmElement.type === 'link' ? deleteLink() : deleteCategory()">
                    Confirmer
                </button>
                <button class="btn btn-sm btn-default" @click.prevent="confirmAlert = false">Annuler</button>
            </div>
        </transition>

        <div class="row">
            <div class="col-md-6" v-for="category in links">
                <div class="panel panel-default">
                    <div class="panel-heading">
                        {{ category.name }}
                        <button class="btn btn-xs btn-warning pull-right" v-if="adminVersion" @click.prevent="confirmAlert = true; confirmElement.type = 'category'; confirmElement.element = category.name">
                            Supprimer la catégorie
                        </button>
                    </div>
                    <div class="panel-body">
                        <ul>
                            <li v-for="link in category.data" class="text-inline" @mouseover="hoverElement = link">
                                <a :href="link.url" target="_blank">{{ link.name }}</a>
                                <span class="text-muted" v-if="link.description != null">
                                    ( {{ link.description }} )
                                </span>
                                <button type="button" class="close" v-if="hoverElement === link" @click.prevent="confirmAlert = true; confirmElement.type = 'link'; confirmElement.element = link.name">
                                    &times;
                                </button>
                                <div class="clearfix"></div>
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

        <div class="panel panel-default" v-if="serverAvailable">
            <div class="panel-heading">Importation | Exportation</div>
            <div class="panel-body">
                <button class="btn btn-default" @click.prevent="addError('Fonction non mise en place', 3000)">
                    Importer depuis JSON
                </button>
                <button class="btn btn-default" @click.prevent="exportJson()">Exporter en JSON</button>
                <transition name="fade">
                    <div v-if="exportElement.data != null">
                        <hr>
                        <pre>{{ exportElement }}</pre>
                        <div class="pull-right">
                            <button class="btn btn-default" @click.prevent="exportElement = {type: null,data: null}">
                                Fermer
                            </button>
                        </div>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
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
                links: [],
                serverAvailable: false,
                serverUrl: null,
                timeout: null,
                hoverElement: null,
                confirmAlert: false,
                confirmElement: {
                    type: null,
                    element: null
                },
                exportElement: {
                    type: null,
                    data: null
                }
            }
        },
        mounted () {
            this.serverUrl = (process.env.NODE_ENV) === 'development' ? 'http://localhost/Projets/links/server/server.php' : 'server/server.php'
            this.$http.get(this.serverUrl).then(response => {
                this.links = Object.values(response.body)
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
                if (this.confirmElement.element != null) {
                    let self = this
                    this.links = this.links.filter(function (category) {
                        return (category.name != self.confirmElement.element) ? category : null
                    })
                    if (this.serverAvailable) {
                        this.$http.get(this.serverUrl, {
                            params: {
                                deleteCategory: this.confirmElement.element,
                            }
                        })
                    }
                    this.confirmAlert = false
                    this.confirmElement.type = null
                    this.confirmElement.element = null
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
                                self.$http.get(self.serverUrl, {
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
            deleteLink (linkId) {
                this.addError('Fonction non-disponible pour le moment', 2000)
            },
            exportJson () {
                this.exportElement.type = 'JSON'
                this.exportElement.data = JSON.stringify(this.links)
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