import { createSlice, current } from '@reduxjs/toolkit'


const orderType = {
  BID: 'BID',
  ASK: 'ASK'
}

const initialState = {
  rawBids: [],
  bids: [],
  rawAsks: [],
  asks: [],
  lastprice: [],
  prevBids: [],
  prevAsks: []
}

export const orderbookDataProcess = createSlice({
  name: 'orderbook',
  initialState,
  reducers: {
    addBids: (state, { payload }) => {
      state.prevBids = current(state).bids
      let rowBids = sortByPrice(
        applyDeltas(current(state).rawBids, payload),
        orderType.BID
      )
      let updatedBids = addTotalSums(rowBids)
      state.bids = updatedBids
      state.rawBids = rowBids
    },
    addAsks: (state, { payload }) => {
      state.prevAsks = current(state).asks
      let rowAsks = sortByPrice(
        applyDeltas(current(state).rawAsks, payload),
        orderType.ASK
      )
      let updatedAsks = addTotalSums(rowAsks)
      state.asks = updatedAsks
      state.rawAsks = rowAsks
    },
    addExistingState: (state, { payload }) => {
      let rawBids = sortByPrice(payload.bids, orderType.BID)
      let rawAsks = sortByPrice(payload.asks, orderType.ASK)
      let bids = addTotalSums(rawBids)
      let asks = addTotalSums(rawAsks)

      state.rawBids = rawBids
      state.rawAsks = rawAsks
      state.bids = bids
      state.asks = asks
    },
    updateLastPrice: (state, { payload }) => {
      let priceObj = payload
      priceObj.prevPrice = state.lastprice.price
      state.lastprice = priceObj
    }
  }
})

const removePriceLevel = (price, levels) =>
  levels.filter(level => level[0] !== price)

const updatePriceLevel = (updatedLevel, levels) => {
  return levels.map(level => {
    if (level[0] === updatedLevel[0]) {
      level = updatedLevel
    }
    return level
  })
}

const levelExists = (deltaLevelPrice, currentLevels) =>
  currentLevels.some(level => level[0] === deltaLevelPrice)

const addPriceLevel = (deltaLevel, levels) => {
  return [...levels, deltaLevel]
}

const applyDeltas = (currentLevels, orders) => {
  let updatedLevels = currentLevels
  let sortedOrder = [...orders].sort((curr, next) => {
    return parseInt(next[1]) - parseInt(curr[1])
  })
  sortedOrder.forEach(deltaLevel => {
    const deltaLevelPrice = deltaLevel[0]
    const deltaLevelSize = deltaLevel[1]
    if (deltaLevelSize === '0') {
      updatedLevels = removePriceLevel(deltaLevelPrice, updatedLevels)
    } else {
      if (levelExists(deltaLevelPrice, currentLevels)) {
        updatedLevels = updatePriceLevel(deltaLevel, updatedLevels)
      } else {
        updatedLevels = addPriceLevel(deltaLevel, updatedLevels)
      }
    }
  })

  return updatedLevels
}

const addTotalSums = orders => {
  const totalSums = []
  return orders.map((order, idx) => {
    const size = parseInt(order[1])
    const updatedLevel = [...order]
    const totalSum = idx === 0 ? size : size + totalSums[idx - 1]
    updatedLevel[2] = totalSum
    totalSums.push(totalSum)
    return updatedLevel
  })
}

const sortByPrice = (orders, type) => {
  return [...orders].sort((curr, next) => {
    let result = 0
    if (type === orderType.BID) {
      result = parseFloat(next[0]) - parseFloat(curr[0])
    } else {
      result = parseFloat(curr[0]) - parseFloat(next[0])
    }
    return result
  })
}

export const { addBids, addAsks, addExistingState, updateLastPrice } =
  orderbookDataProcess.actions

export const selectBids = state => state.orderbook.bids
export const selectAsks = state => state.orderbook.asks
export const selectPrevBids = state => state.orderbook.prevBids
export const selectPrevAsks = state => state.orderbook.prevAsks
export const selectLastPrice = state => state.orderbook.lastprice

export default orderbookDataProcess.reducer
