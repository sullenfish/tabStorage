# tabStorage
**tabStorage** is sessionStorage synced across open tabs.

You can treat it just like sessionStorage; it supports the full [Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Storage).

## Usage:

```JavaScript
// import tabStorage via your method of choice for ES2015 modules
import {TabStorage} from 'tabStorage.js'

// initialize tabStorage (note: it doesn't have to be global)
window.tabStorage = new TabStorage()

// store something
tabStorage.setItem('cheese', 'cheddar')

// open a new tab with the same origin

// import tabStorage to this tab
import {TabStorage} from 'tabStorage.js'

// initialize
window.tabStorage = new TabStorage()

// retrieve the stored value and assign it
let cheese = tabStorage.getItem('cheese', 'cheddar')

// cheese === 'cheddar'

// store a new key value pair
tabStorage.setItem('beverage', 'wine')

// navigate back to the previous tab

// retrieve the stored value and assign it
let beverage = tabStorage.getItem('beverage')

// beverage === 'wine'
```
