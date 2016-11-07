export default class TabStorage {
	constructor(sync = true, direction = 'both') {
		this.guid = TabStorage.guid()

		if (!sessionStorage.getItem('tabStorage')) {
			this.clear(false)
		}

		window.addEventListener('storage', this.eventHandler.bind(this))

		if (sync) {
			this.emit('sync', direction, localStorage.getItem('tabStorage'), direction === 'out' ? this.guid : undefined)
		}

		return new Proxy(this, {
			get: function(target, key, receiver) {
				if (typeof target[key] !== 'undefined') {
					return target[key]
				} else {
					return target.getItem(key)
				}
			}
			, getOwnPropertyDescriptor: function(target, key) {
				if (key === 'guid') {
					return {configurable: true, enumerable: false}
				} else if (target.keys().includes(key)) {
					return {configurable: true, enumerable: true}
				} else {
					return Reflect.getOwnPropertyDescriptor(target, key)
				}
			}
			, ownKeys: function(target) {
				return Reflect.ownKeys(target).concat(target.keys())
			}
			, set: function(target, key, value, receiver) {
				target.setItem(key, value)
				return true
			}
		})
	}

	clear(emit = true) {
		sessionStorage.setItem('tabStorage', JSON.stringify({}))
		if (emit) {
			this.emit('clear')
		}
	}

	emit(message, ...[key, value, guid]) {
		localStorage.setItem(
			'tabStorage'
			, JSON.stringify({
				message
				, key
				, value
				, guid
			})
		)
		localStorage.removeItem('tabStorage')
	}

	eventHandler(event) {
		if (event.key === 'tabStorage') {
			console.debug('received tabStorage')
		}
		if (!event.newValue) {
			return
		}
		if (event.key === 'tabStorage') {
			const {message, key, value, guid} = JSON.parse(event.newValue)
			switch (message) {
				case 'clear':
					console.debug('clear()')
					this.clear(false)
					break
				case 'removeItem':
					console.debug(`removeItem('${key}')`)
					this.removeItem(key, false)
					break
				case 'setItem':
					console.debug(`setItem('${key}', '${value}')`)
					this.setItem(key, value, false)
					break
				case 'sync':
					if ((key === 'out' && (!guid || guid === this.guid)) || key === 'both') {
						this.setItems(value, false)
					}
					if (key === 'in' || key === 'both') {
						this.emit('sync', 'out', sessionStorage.getItem('tabStorage'), guid)
					}
					break
				default:
					console.debug(`${message} event unhandled`)
			}
		}
	}

	static guid() {
		let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
		return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
	}

	get length() {
		return Object.keys(
			JSON.parse(sessionStorage.getItem('tabStorage'))
		).length
	}

	getItem(key) {
		return JSON.parse(
			sessionStorage.getItem('tabStorage')
		)[key]
	}

	key(n) {
		const key = this.keys()[n]
		return key ? key : null
	}

	keys() {
		return Object.keys(JSON.parse(sessionStorage.getItem('tabStorage')))
	}

	removeItem(key, emit = true) {
		let tsObj = JSON.parse(sessionStorage.getItem('tabStorage'))
		delete tsObj[key]
		sessionStorage.setItem(
			'tabStorage'
			, JSON.stringify(tsObj)
		)
		if (emit) {
			this.emit('removeItem', key)
		}
	}

	setItem(key, value, emit = true) {
		sessionStorage.setItem(
			'tabStorage'
			, JSON.stringify(
				Object.assign(
					{}
					, JSON.parse(sessionStorage.getItem('tabStorage'))
					, {[key]: value}
				)
			)
		)
		if (emit) {
			this.emit('setItem', key, value)
		}
	}

	setItems(items, emit = true) {
		if (typeof items === 'string') {
			items = JSON.parse(items)
		}
		sessionStorage.setItem(
			'tabStorage'
			, JSON.stringify(
				Object.assign(
					{}
					, JSON.parse(sessionStorage.getItem('tabStorage'))
					, items
				)
			)
		)
		if (emit) {
			this.emit('sync', 'out', sessionStorage.getItem('tabStorage'))
		}
	}

}
