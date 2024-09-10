import './assets/main.css'
import Vueform from '@vueform/vueform'
import vueformConfig from '../vueform.config'

import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(Vueform, vueformConfig)
app.mount('#app')
