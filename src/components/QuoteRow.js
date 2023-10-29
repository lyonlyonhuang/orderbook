import React from 'react';
import styled, { keyframes, css } from 'styled-components';
import { formatNumber, formatPrice } from '../helper';

const Price = styled.td`
    color: ${props => props.$orderType ==='ASK' ? "#FF5B5A" : "#00b15d"};
`;
const Row = styled.tr`
    &:hover {
        background-color: #1E3059;
    }
    ${(props) => {
        if(props.$prevLevelAlreadyExist.length === 0) {
            if(props.$orderType === 'ASK') {
                return css`
                    animation: ${askFlash} 1s 1 linear;
                `;
            } else {
                return css`
                    animation: ${bidFlash} 1s 1 linear;
            `;
            }
        }
    }}
`
const askFlash = keyframes`
    from {
        background-color: rgba(255, 91, 90, 0.5);
    }
    to {
        background-color: rgba(255, 91, 90, 0);
    }
`
const bidFlash = keyframes`
    from {
        background-color: rgba(0, 177, 93, 0.5);
    }
    to {
        background-color: rgba(0, 177, 93, 0);
    }
`

const Size = styled.td`
    text-align: end;
    ${(props) => {
        if(props.$deltaSize > 0) {
            return css`
                animation: ${askFlash} 1.5s 1 linear;
            `;
        } 
        if(props.$deltaSize < 0) {
            return css`
                animation: ${bidFlash} 1.5s 1 linear;
            `;
        }
    }}
`
const Total = styled.td`
    position: absolute;
    text-align: end;
    width:40%;
    &::before {
        ${(props) => {
            if(props.$orderType === 'ASK') {
                return css`
                    content: "";
                    position: absolute;
                    right:0;
                    width:${props.$percentage}%;
                    height: 100%;
                    background-color: rgba(255, 90, 90, 0.12);
                `;
            } else {
                return css`
                    content: "";
                    position: absolute;
                    right:0;
                    width:${props.$percentage }%;
                    height: 100%;
                    background-color: rgba(16, 186, 104, 0.12);
            `;
            }
        }}
    }
`


function QuoteRow ({price, size, total, orderType, prevLevelAlreadyExist, maxTotal}) {
    let deltaSize = 0
    if(prevLevelAlreadyExist.length !== 0) {
        deltaSize = parseInt(prevLevelAlreadyExist[0][1]) - parseInt(size)
    }
    let percentage = (total / maxTotal) * 100
   
    return ( 
        <Row $prevLevelAlreadyExist={prevLevelAlreadyExist} $orderType={orderType} >
          <Price $orderType={orderType} >{formatPrice(price)}</Price>
          <Size $deltaSize={deltaSize} >{formatNumber(size)}</Size>
          <Total $orderType={orderType} $percentage={percentage}>{formatNumber(total)}</Total>
        </Row>
     );
}

export default QuoteRow ;