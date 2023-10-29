import React from 'react'
import styled, { css } from 'styled-components'
import { formatPrice } from '../helper'
import Icon from '../icons/icons'

const Price = styled.tr`
  text-align: center;
  font-weight: bolder;
  font-size: 20px;
  height: 28px;
  line-height: 28px;
  ${props => {
    switch (props.$lastprice) {
      case 'UP':
        return css`
          color: #00b15d;
          background-color: rgba(16, 186, 104, 0.12);
        `
      case 'DOWN':
        return css`
          color: #ff5b5a;
          background-color: rgba(255, 90, 90, 0.12);
        `
      default:
        return css`
          color: #f0f4f8;
          background-color: rgba(134, 152, 170, 0.12);
        `
    }
  }}
`
const ArrowIconWrapper = styled.span`
  display: inline-block;
  margin-left: 5px;
  ${props => {
    switch (props.$lastprice) {
      case 'UP':
        return css`
          transform: rotate(180deg);
          transform-origin: 50% 50%;
          & path {
            fill: #00b15d;
          }
        `
      case 'DOWN':
        return css`
          & path {
            fill: #ff5b5a;
          }
        `
      default:
        return css`
          display: none;
        `
    }
  }}
`

function LastPrice ({ lastprice }) {
  let res = 0
  if (lastprice.prevPrice === undefined) {
    res = 0
  }
  if (lastprice.price - lastprice.prevPrice > 0) {
    res = 'UP'
  }
  if (lastprice.price - lastprice.prevPrice < 0) {
    res = 'DOWN'
  }

  return (
    <Price $lastprice={res}>
      <td colSpan={3}>
        {formatPrice(lastprice.price)}
        <ArrowIconWrapper $lastprice={res}>
          <Icon.ArrowDown style={{ width: '17px', height: '17px' }} />
        </ArrowIconWrapper>
      </td>
    </Price>
  )
}

export default LastPrice
