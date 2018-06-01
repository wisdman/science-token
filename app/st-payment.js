;(function() {
  const ADDRESS_RX = /^0x[a-f0-9]{40}$/i

  class STPaymet {
    constructor(contract) {
      if (typeof contract !== "string" || !ADDRESS_RX.test(contract)) {
        throw new TypeError("Incorrect Ethereum Address")
      }
      this._contract = contract

      this._asyncInit = new Promise((resolve) => {
        const readyHandler = () => {
          if (document.readyState === "complete") {
            resolve(true)
          }
        }

        document.addEventListener("readystatechange", readyHandler)
        readyHandler()
      })
    }

    async asyncInit() {
      return this._asyncInit
    }

    async checkProvider() {
      await this.asyncInit()

      if (typeof window.Web3 !== "function") {
        throw new Error("Ethereum provider is not found")
      }

      this.web3 = new Web3(web3.currentProvider)
      const coinbase = this.web3.eth.coinbase

      if (typeof coinbase !== "string") {
        throw new Error("Ethereum provider has unknown address")
      }

      const ballance = await (() => {
        return new Promise((resolve, reject) => {
          this.web3.eth.getBalance(coinbase, (error, ballance) => {
            if (error) {
              reject(error)
            } else {
              resolve(ballance.toNumber())
            }
          })
        })
      })()

      if (Number.isNaN(ballance)) {
        throw new Error("Ethereum provider internal error")
      }

      return true
    }

    async payment(amount) {
      await this.asyncInit()
      await this.checkProvider()

      amount = parseFloat(amount)
      console.dir(amount)
      if (Number.isNaN(amount) || amount <= 0) {
        throw new TypeError("Incorrect amount value")
      }

      const transaction = {
        to: this._contract,
        value: this.web3.toWei(amount, "ether"),
      }

      const result = await (() => {
        return new Promise((resolve) => {
          this.web3.eth.sendTransaction(transaction, (error, result) => {
            if (error) {
              reject(error)
            } else {
              resolve(result)
            }
          })
        })
      })()

      return result
    }
  }

  window.STPaymet = STPaymet
})()
