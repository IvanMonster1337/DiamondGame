import en from '@vueform/vueform/locales/en'
import vueform from '@vueform/vueform/dist/vueform'
import { Validator, defineConfig } from '@vueform/vueform'

// You might place these anywhere else in your project
import '@vueform/vueform/dist/vueform.css'

const is_odd = class extends Validator {
  get msg() {
    return 'The :attribute must be odd'
  }

  check(value: string) {
    return parseInt(value, 10) % 2 !== 0
  }
}

export default defineConfig({
  theme: vueform,
  axios: { baseURL: 'http://localhost:3000', withCredentials: false, headers: { Accept: '*' } },
  rules: {
    is_odd
  },
  locales: { en },
  locale: 'en'
})
