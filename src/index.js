import Map from './core/map'
export * from './constants'
export * from './model/index'
export * from './overlay/index'
export * from './objects/index'
export { Map }

if (IS_DEBUG) {
    console.log(process.env.NODE_ENV)
}
