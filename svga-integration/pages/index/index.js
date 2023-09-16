const app = getApp()

const Images = [
  'https://assets.2dfire.com/frontend/73f92353f203291eff3e6d16f956e23a.svga',
  'https://assets.2dfire.com/frontend/c4c57036cc9b5b3f4f02ecb60d714732.svga',
  'https://assets.2dfire.com/frontend/91c263d52b2b1be71f52c2183d2d7194.svga',
  'https://assets.2dfire.com/frontend/dafed8904c2ad588818c334a14dba5b5.svga',
  'https://assets.2dfire.com/frontend/dd5cdd2b10095231661229a14b2038ec.svga',
  'https://assets.2dfire.com/frontend/ba8343ea75162374d50dae084729b679.svga',
  'https://assets.2dfire.com/frontend/248675ab8c6ff57dce0f26bd4020487b.svga',
  'https://assets.2dfire.com/frontend/5b3e348766f24e3ab486f7cc2397f3be.svga',
  'https://assets.2dfire.com/frontend/f84d377f3c1f4d0693ec5f3a7d6d6838.svga'
]

Page({
  data: {
    url: ''
  },

  shuffle (values) {
    for (let i = 0; i < values.length; i++) {
      const ranIndex = Math.floor(Math.random() * (i + 1))
      const itemAtIndex = values[i]
  
      values[i] = values[ranIndex]
      values[ranIndex] = itemAtIndex
    }
  },

  randomSwitch() {
    const { length } = Images
    const index = Math.floor(Math.random() * length)

    this.shuffle(Images)
    this.setData({ url: Images[index] })
  },

  handleSwitch() {
    this.randomSwitch()
  },

  onLoad() {
    this.randomSwitch()
  },
})
