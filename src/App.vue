<template>
    <div>
        <h1>Ma liste de liens</h1>

        <div class="panel panel-default">
            <div class="panel-heading">
                <a href="#" @click.prevent="newLink.open = !newLink.open">Ajouter un nouveau lien</a>
            </div>
            <transition name="fade">
                <div class="panel-body" v-if="newLink.open">
                    <label for="newLinkCategory">Catégorie :</label>
                    <div class="input-group" v-if="!newCategory.show">
                        <select id="newLinkCategory" class="form-control" v-model="newLink.category">
                            <option :value="null">Choissiez une catégorie</option>
                            <option v-for="(category, index) in searchCategories()" :value="category" :key="true">
                                {{ category }}
                            </option>
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
                    <button class="btn btn-default" @click.prevent="addLink()">Ajouter ce lien</button>
                </div>
            </transition>
        </div>

        <div class="alert alert-warning" v-if="errors.length != 0">
            <ul>
                <li v-for="error in errors">{{ error }}</li>
            </ul>
        </div>

        <div class="row">
            <div class="col-md-6" v-for="category in links">
                <div class="panel panel-default">
                    <div class="panel-heading">{{ category.name }}</div>
                    <div class="panel-body">
                        <ul>
                            <li v-for="link in category.data"><a :href="link.url" target="_blank">
                                {{ link.name }}</a>
                            </li>
                        </ul>
                    </div>
                </div>
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
                newCategory: {
                    show: false,
                    name: null
                },
                newLink: {
                    open: false,
                    name: null,
                    category: null,
                    url: null
                },
                links: [
                    {
                        name: 'cat1',
                        data: [
                            {
                                name: 'Mon lien 1',
                                url: ''
                            },
                            {
                                name: 'Mon lien 2',
                                url: ''
                            },
                            {
                                name: 'Mon lien 3',
                                url: ''
                            }
                        ]
                    },
                    {
                        name: 'cat2',
                        data: [
                            {
                                name: 'Mon lien 4',
                                url: ''
                            },
                            {
                                name: 'Mon lien 5',
                                url: ''
                            },
                            {
                                name: 'Mon lien 6',
                                url: ''
                            }
                        ]
                    }
                ]
            }
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
            addLink () {
                if (this.checkField(this.newLink.name) && this.checkField(this.newLink.url) && this.checkField(this.newLink.category)) {
                    this.addCategory(this.newLink.category)
                    let self = this
                    this.links.filter(function (link) {
                        if (link.name === self.newLink.category) {
                            if (!['http://', 'https:/'].includes(self.newLink.url.substring(0, 7))) {
                                self.newLink.url = 'http://' + self.newLink.url
                            }
                            link.data.push({
                                name: self.newLink.name,
                                url: self.newLink.url
                            })
                            self.resetFields()
                        }
                    })
                } else {
                    this.addError('Les champs "Nom du lien", "Lien correspondant" et "Catégorie" doivent êtres renseignés.')
                }
            },
            resetFields () {
                this.newLink = {
                    open: false,
                    name: null,
                    category: null,
                    url: null
                }
            },
            addError (message) {
                this.errors.push(message)
                let self = this
                setTimeout(function () {
                    self.errors.splice(0, self.errors.length)
                }, 5000)
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