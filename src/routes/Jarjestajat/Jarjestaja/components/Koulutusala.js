import _ from 'lodash'
import React, { Component } from 'react'
import styled from 'styled-components'

import arrow from 'static/images/koulutusala-arrow.svg'
import { COLORS } from "../../../../modules/styles"
import Tutkinto from "./Tutkinto"

const Wrapper = styled.div`
  margin: 4px 0;
  background-color: ${COLORS.BG_GRAY};
  max-width: 625px;
`

const Heading = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  padding:  10px 20px;
  
  &:hover {
    background-color: ${COLORS.BG_DARKER_GRAY};
  }
`

const Arrow = styled.img`
  margin-right: 20px;
  ${props => props.rotated ? `transform: rotate(90deg);` : null}
`

const Span = styled.span`
  margin-right: 15px;
`

const KoulutusalaList = styled.div`
  padding:  5px 20px 10px;
`

const SubAlaWrapper = styled.div`
  margin: 5px 0 20px;
  font-size: 15px;
  font-weight: bold;
`

const SubAla = (props) => {
  console.log(props)
  const { nimi, tutkinnot } = props
  return (
    <SubAlaWrapper>
      <div>{nimi}</div>
      {_.map(tutkinnot, (tutkinto, i) => {
        return <Tutkinto {...tutkinto} key={i} />
      })}
    </SubAlaWrapper>
  )
}

class Koulutusala extends Component {
  constructor() {
    super()
    this.state = {
      isHidden: true
    }
  }

  toggleTutkintoList() {
    this.setState({
      isHidden: !this.state.isHidden
    })
  }

  getTutkintoCount(koulutusalat) {
    let count = 0

    _.forEach(koulutusalat, (ala) => {
      count += ala.tutkinnot.length
    })

    return count
  }

  render() {
    const { koodi, nimi, koulutusalat } = this.props

    // console.log(this.props)
    return (
      <Wrapper>
        <Heading onClick={this.toggleTutkintoList.bind(this)}>
          <Arrow src={arrow} alt="Koulutusala" rotated={!this.state.isHidden} />
          <Span>{koodi}</Span>
          <Span>{nimi}</Span>
          <Span>{`( ${this.getTutkintoCount(koulutusalat)} kpl )`}</Span>
        </Heading>
        {!this.state.isHidden &&
          <KoulutusalaList>
            {_.map(koulutusalat, (ala, i) => {
              return (
                <SubAla {...ala} key={i}/>
                // <Tutkinto {...ala} key={i} />
              )
            })}
          </KoulutusalaList>
        }

      </Wrapper>
    )
  }
}

export default Koulutusala
