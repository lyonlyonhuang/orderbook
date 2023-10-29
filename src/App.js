import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  addAsks,
  addBids,
  addExistingState,
  updateLastPrice,
  selectAsks,
  selectBids,
  selectLastPrice,
  selectPrevBids,
  selectPrevAsks
} from './components/orderbookDataProcess'
import QuoteRow from './components/QuoteRow'
import LastPrice from './components/LastPrice'
import './App.css'

const WSS_ORDERBOOK_URL = 'wss://ws.btse.com/ws/oss/futures'
const WSS_LASTPRICE_URL = 'wss://ws.btse.com/ws/futures'
let currentBids = []
let currentAsks = []

function App () {
  const bids = useSelector(selectBids)
  const asks = useSelector(selectAsks)
  const lastprice = useSelector(selectLastPrice)
  const prevbids = useSelector(selectPrevBids)
  const prevasks = useSelector(selectPrevAsks)
  const wsORDERBOOK = useRef(null);
  const wsLASTPRICE = useRef(null);

  const dispatch = useDispatch()

  const unSubscribeUpdateMessage = {
    op: 'unsubscribe',
    args: ['update:BTCPFC']
  }

  const subscribeUpdateMessage = {
    op: 'subscribe',
    args: ['update:BTCPFC']
  }

  const subscribeTradeHistoryApiMessage = {
    op: 'subscribe',
    args: ['tradeHistoryApi:BTCPFC']
  }

  useEffect(() => {
    wsORDERBOOK.current  = new WebSocket(WSS_ORDERBOOK_URL)
    wsORDERBOOK.current.onopen = () => {
      wsORDERBOOK.current.send(JSON.stringify(unSubscribeUpdateMessage))
      wsORDERBOOK.current.send(JSON.stringify(subscribeUpdateMessage))
    }
    wsORDERBOOK.current.onmessage = event => {
      processMessages(event)
    }
    wsORDERBOOK.current.onclose = () => {
      wsORDERBOOK.current.close()
    }

    return () => {
      wsORDERBOOK.current.close()
    }
  }, [])

  useEffect(() => {
    wsLASTPRICE.current  = new WebSocket(WSS_LASTPRICE_URL)
    wsLASTPRICE.current.onopen = () => {
      wsLASTPRICE.current.send(JSON.stringify(subscribeTradeHistoryApiMessage))
    }
    wsLASTPRICE.current.onmessage = event => {
      processLastPrice(event)
    }
    wsLASTPRICE.current.onclose = () => {
      wsLASTPRICE.current.close()
    }

    return () => {
      wsLASTPRICE.current.close()
    }
  }, [])

  const processMessages = event => {
    let response = JSON.parse(event.data)
    if (response.topic === 'update:BTCPFC' ) {   
    
      if (response.data.type === 'snapshot') {
        dispatch(addExistingState(response.data))
      } else {
        process(response.data)
      }
    }
  }

  const processLastPrice = event => {
    let response = JSON.parse(event.data)
    if (response.topic === 'tradeHistoryApi') {
      let lastprice = response.data[0]
      dispatch(updateLastPrice(lastprice))
    }
  }

  const process = data => {
      if (data.bids.length > 0) {
        currentBids = [...currentBids, ...data.bids]
        if (currentBids.length > 0) {
          dispatch(addBids(currentBids))
          currentBids = []
          currentBids.length = 0
        }
      }
      if (data.asks.length > 0) {
        currentAsks = [...currentAsks, ...data.asks]
        if (currentAsks.length > 0) {
          dispatch(addAsks(currentAsks))
          currentAsks = []
          currentAsks.length = 0
        }
      }
  }

  const buildPriceLevels = (levels, prevlevels, orderType) => {
    let orders = [...levels].slice(0, 8)
    let prevorders = [...prevlevels].slice(0, 8)
    let maxTotal = orders[7][2]
    if (orderType === 'ASK') {
      orders = orders.reverse().slice(0, 8)
      prevorders = prevorders.reverse().slice(0, 8)
      maxTotal = orders[0][2]
    }

    return orders.map(level => {
      const price = level[0]
      const size = level[1]
      const total = level[2]
      const prevLevelAlreadyExist = prevorders.filter(
        prevorder =>  prevorder[0] === level[0])
      return (
        <QuoteRow
          key={size + total}
          total={total}
          size={size}
          price={price}
          orderType={orderType}
          prevLevelAlreadyExist={prevLevelAlreadyExist}
          maxTotal={maxTotal}
        />
      )
    })
  }

  return (
    <div className='orderbook'>
      <div className='orderbook-header'>Order Book</div>
      <hr style={{width:'100%', height:'1px', borderLeft:'0', borderBottom:'0', borderRight:'0'}}/>
      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'start' }}>Price(USD)</th>
            <th style={{ textAlign: 'end' }}>Size</th>
            <th style={{ width: '40%', textAlign: 'end' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bids.length && asks.length ? (
            <>
              {buildPriceLevels(asks, prevasks, 'ASK')}
              <LastPrice lastprice={lastprice} />
              {buildPriceLevels(bids, prevbids, 'BID')}
            </>
          ) : (
            <tr>
              <td>Loading</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App
