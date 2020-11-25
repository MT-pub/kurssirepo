import React, { useReducer, useEffect, useMemo } from 'react'
import './App.css'
import { Button, AppBar, Toolbar } from '@material-ui/core'
import DrawTest from './DrawTest'
import axios from 'axios'
import SubjectChart from './Chart'

const initialData = [{
  id: 0,
  test: "Elektroniikka",
  questions: [{
    question: "Mikä seuraavista on Ohmin laki?",
    answers: [{ answer: "U = R * I", checked: false, correct: true },
    { answer: "U = R / I", checked: false, correct: false },
    { answer: "U = R^2 * I", checked: false, correct: false },
    { answer: "U = R / I^2", checked: false, correct: false }]
  },
  {
    question: "Mikä on Kirchhoffin virtalaki?",
    answers: [{ answer: "Sähkövirtaa tulee pisteeseen yhtä monta reittiä, kuin sitä kyseisestä pisteestä poistuu", checked: false, correct: false },
    { answer: "Sähkövirta tulee pisteeseen samansuuntaisena, kuin se kyseisestä pisteestä poistuu", checked: false, correct: false },
    { answer: "Sähkövirta tulee pisteeseen vastakkaiselta suunnalta, kuin se kyseisestä pisteestä poistuu", checked: false, correct: false },
    { answer: "Sähkövirtaa tulee pisteeseen yhtä paljon, kuin sitä kyseisestä pisteestä poistuu", checked: false, correct: true }]
  }]
},
{
  id: 1,
  test: "Matematiikka",
  questions: [{
    question: "Kuinka paljon on 1 + 1?",
    answers: [{ answer: "4", checked: false, correct: false },
    { answer: "3", checked: false, correct: false },
    { answer: "2", checked: false, correct: true },
    { answer: "1", checked: false, correct: false }]
  },
  {
    question: "Kuinka paljon on 12345 + 54321?",
    answers: [{ answer: "1234554321", checked: false, correct: false },
    { answer: "123454321", checked: false, correct: false },
    { answer: "66666", checked: false, correct: true },
    { answer: "55555", checked: false, correct: false }]
  }]
}];

function reducer(state, action) {
  let deepCopy = JSON.parse(JSON.stringify(state));

  //console.log(deepCopy)
  switch (action.type) {
    case 'handleCheckbox':
      deepCopy.data[deepCopy.activeTest]
        .questions[action.qIndex]
        .answers[action.aIndex].checked = action.event.target.checked
      return deepCopy
    /* case 'setFetchData':
      deepCopy.fetchData = action.fetchData
      return deepCopy */
    case 'setTest':
      deepCopy.activeTest = action.test
      //console.log(deepCopy.test)
      return deepCopy
    case 'setAnswers':
      deepCopy.answers = action.answers
      return deepCopy
    case 'triggerShowChart':
      deepCopy.showChart = !deepCopy.showChart
      return deepCopy
    case 'INIT_DATA':
      deepCopy.fetchData = action.fetchData
      deepCopy.data = action.data
      return deepCopy
    default:
      throw new Error('No action specified')
  }
}

function App() {

  const [state, dispatch] = useReducer(reducer, { data: [], activeTest: "", fetchData: true, answers: false, showChart: false });

  const createRemData = async () => {
    try {
      await axios.post("http://localhost:3001/tests", initialData)
      dispatch({ type: "INIT_DATA", data: initialData, fetchData: false })
    }
    catch (exception) {
      alert("Tietokannan alustaminen epäonnistui")
    }
  };

  const fetchRemData = async () => {
    try {
      let result = await axios.get("http://localhost:3001/tests")
      //console.log(result)
      if (result.data.length > 0) {
        //console.log("fetchIf")
        dispatch({ type: "INIT_DATA", data: result.data, fetchData: false })
      } else {
        throw new Error("Ei dataa.. luodaan..")

      }
    }
    catch (exception) {
      console.log(exception)
      createRemData()
    }
  };

  const saveRemData = async () => {
    try {
      await axios.put("http://localhost:3001/tests", state.data)
    }
    catch (exception) {
      console.log("Datan päivitys ei onnistunut ", exception)
    }
  };

  useEffect(() => {
    fetchRemData()
  }, [])

  useEffect(() => {
    if (!state.fetchData) {
      saveRemData()
    }
  }, [state.data])

  const testButtons = useMemo(() => {
    if (state.data !== []) {
      return (state.data.map((item, index) =>
        <Button key={"" + index + state.data[index].test}
          color="primary" onClick={() => {
            dispatch({ type: "setTest", test: index });
            dispatch({ type: "setAnswers", answers: false });
          }}
        >
          {item.test}
        </Button>
      ))
    }
  }, [state.data])

  //console.log(state.data)
  if (!state.showChart) {
    return (
      <div className="App">
        <AppBar position="static" color="primary">
          <Toolbar>
            <Button onClick={() => {
              dispatch({ type: "triggerShowChart" })
            }}>
              Kuvaajanappi
          </Button>
          </Toolbar>
        </AppBar>
        <div className="page">
          <div>
            {testButtons}
          </div>
          {/* <img src='./selma_pieni2.8d5eb9aa.png' className='App-logo'></img> */}
          <div className="test">
            <DrawTest testData={state.data[state.activeTest]} dispatch={dispatch}
              answers={state.answers} testIndex={state.activeTest} />
          </div>
        </div>
      </div >
    );
  } else if (state.showChart) {
    return (
      <div className="App">
        <AppBar position="static" color="primary">
          <Toolbar>
            <Button onClick={() => {
              dispatch({ type: "triggerShowChart" })
            }}>
              Kuvaajanappi
          </Button>
          </Toolbar>
        </AppBar>
        <div className="page">
          <SubjectChart />
        </div>
      </div >
    );
  }
}

export default App;