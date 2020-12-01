import React, { Suspense, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import promiseMiddleware from 'redux-promise';
import ReduxThunk from 'redux-thunk';
import { Icon } from 'antd';
import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Dropzone from 'react-dropzone';

import {
  Form,
  Input,
  Button,
} from 'antd';
const regex = /[.*+:%@#!`'"&;~/?^${}()|[\]\\]/g
const config = {
  MAGIC_HOST: ""
};

if (process.env.NODE_ENV === 'production') {
  config.MAGIC_HOST = window.location.origin
} else {
  config.MAGIC_HOST = 'http://localhost:5000';
}
axios.defaults.baseURL = config.MAGIC_HOST
axios.defaults.withCredentials = true


const LOGIN_USER = 'login_user';
const REGISTER_USER = 'register_user';
const AUTH_USER = 'auth_user';
const LOGOUT_USER = 'logout_user';

const USER_SERVER = '/api/users';
const FILM_SERVER = '/api/film';



function redux(state = {}, action) {

  switch (action.type) {
    case REGISTER_USER:
      return { ...state, register: action.payload }
    case LOGIN_USER:
      return { ...state, loginSucces: action.payload }
    case AUTH_USER:
      return { ...state, userData: action.payload }
    case LOGOUT_USER:
      return { ...state }

    default:
      return state;
  }
}

const rootReducer = combineReducers({
  redux
});



function registerUser(dataToSubmit) {
  const request = axios.post(`${USER_SERVER}/register`, dataToSubmit)
    .then(response => response.data);

  return {
    type: REGISTER_USER,
    payload: request
  }
}


function loginUser(dataToSubmit) {
  const request = axios.post(`${USER_SERVER}/login`, dataToSubmit)
    .then(response => response.data);

  return {
    type: LOGIN_USER,
    payload: request
  }
}

function auth() {
  const request = axios.get(`${USER_SERVER}/auth`)
    .then(response => response.data);

  return {
    type: AUTH_USER,
    payload: request
  }
}






function Auth(ComposedClass, reload, adminRoute = null) {
  function AuthenticationCheck(props) {

    let redux = useSelector(state => state.redux);
    const dispatch = useDispatch();

    useEffect(() => {

      dispatch(auth()).then(async response => {
        if (await !response.payload.isAuth) {
          if (reload) {
            props.history.push('/login')
          }
        } else {
          if (adminRoute && !response.payload.isAdmin) {
            props.history.push('/')
          }
          else {
            if (reload === false) {
              props.history.push('/')
            }
          }
        }
      })

    }, [dispatch, props.history])

    return (
      <ComposedClass {...props} redux={redux} />
    )
  }
  return AuthenticationCheck
}

const createStoreWithMiddleware = applyMiddleware(promiseMiddleware, ReduxThunk)(createStore);


function NavBar(props) {

  const logoutHandler = () => {
    axios.get(`${USER_SERVER}/logout`).then(response => {
      if (response.status === 200) {
        props.history.push("/login");
      } else {
        alert('Log Out Failed')
      }
    });
  };
  let redux = useSelector(state => state.redux);
  return (
    <>
      <div className="">
        <div className="yellow-line">
          <nav className="navbar   navbar-expand-lg ">
            <Link to="/" className="navbar-brand">FilmAPP</Link>
            <button className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
              <i className="fas fa-bars"></i>
            </button>
            <div className="collapse navbar-collapse" id="navbarCollapse">
              {((redux.userData && !redux.userData.isAuth)) ?
                <ul className="navbar-nav ml-auto">
                  <li className="navbar-item">
                    <Link to="/login" className="nav-link">Signin</Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/signup" className="nav-link">Signup</Link>
                  </li>
                </ul>
                :
                <ul className="navbar-nav ml-auto">
                  <li className="navbar-item">
                    <Link to="/" className="nav-link">Films</Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/upload" className="nav-link">Upload</Link>
                  </li>
                  <li className="navbar-item">
                    <Link to="/settings" className="nav-link">Settings</Link>
                  </li>
                  <li className="navbar-item">
                    <a onClick={logoutHandler} className="nav-link">Log out</a>
                  </li>


                </ul>
              }
            </div>
          </nav>
        </div>


      </div>
    </>
  )
}



function RegisterPage(props) {
  const dispatch = useDispatch();
  return (

    <Formik
      initialValues={{
        email: '',
        name: '',
        password: '',
        confirmPassword: ''
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          let dataToSubmit = {
            email: values.email,
            password: values.password,
            name: values.name,
          };
          dispatch(registerUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
              props.history.push("/login");
            } else {
              alert("Sign up error")
            }
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
        } = props;
        return (
          <div className="register-form-app">
            <h2>Sign up</h2>
            <Form autoComplete="off" className="register-form" onSubmit={handleSubmit} >

              <Form.Item required className={errors.name && touched.name ? "form-item error" : "form-item"} label="Name">
                <Input
                  id="name"
                  placeholder="Enter your name"
                  type="text"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.name && touched.name ? 'text-input error' : 'text-input'
                  }
                />
                {errors.name && touched.name && (
                  <div className="input-feedback">{errors.name}</div>
                )}
              </Form.Item>
              <Form.Item required className={errors.email && touched.email ? "form-item error" : "form-item"} label="Email">
                <Input
                  id="email"
                  placeholder="Enter your email address for contact with you"
                  type="text"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.email && touched.email ? 'text-input error' : 'text-input'
                  }
                />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>
              <Form.Item required className={errors.password && touched.password ? "form-item error" : "form-item"} label="Password">
                <Input
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password && touched.password ? 'text-input error' : 'text-input'
                  }
                />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>

              <Form.Item required className={errors.confirmPassword && touched.confirmPassword ? "form-item error" : "form-item"} label="Confirm Password">
                <Input
                  id="confirmPassword"
                  placeholder="Submit Password"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input'
                  }
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="input-feedback">{errors.confirmPassword}</div>
                )}
              </Form.Item>

              <Form.Item className="submit-btn">
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};


function LoginPage(props) {
  const dispatch = useDispatch();
  const rememberMeChecked = localStorage.getItem("rememberMe") ? true : false;

  const [formErrorMessage, setFormErrorMessage] = useState('')
  const [rememberMe, setRememberMe] = useState(rememberMeChecked);

  const initialEmail = localStorage.getItem("rememberMe") ? localStorage.getItem("rememberMe") : '';
  return (
    <Formik
      initialValues={{
        email: initialEmail,
        password: '',
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            email: values.email,
            password: values.password
          };

          dispatch(loginUser(dataToSubmit))
            .then(response => {
              if (response.payload.loginSuccess) {
                window.localStorage.setItem('userId', response.payload.userId);
                if (rememberMe === true) {
                  window.localStorage.setItem('rememberMe', values.id);
                } else {
                  localStorage.removeItem('rememberMe');
                }
                props.history.push("/");
              } else {
                alert(response.payload.message)
              }
            })
            .catch(err => {
              alert(err)
              setTimeout(() => {
                setFormErrorMessage("")
              }, 3000);
            });
          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          dirty,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          handleReset,
        } = props;
        return (
          <div className="register-form-app">
            <h2>Log In</h2>
            <Form autoComplete="off" className="register-form" onSubmit={handleSubmit} >
              <Form.Item autoComplete="new-password" required className={errors.email && touched.email ? "form-item error" : "form-item"} label="Email">
                <Input
                  id="email"
                  autoComplete="new-password"
                  placeholder="Enter your email address for contact with you"
                  type="text"
                  value={values.email ? values.email : ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.email && touched.email ? 'text-input error' : 'text-input'
                  }
                />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>
              <Form.Item autoComplete="new-password" autoComplete="off" required className={errors.password && touched.password ? "form-item error" : "form-item"} label="Password">
                <Input
                  id="password"
                  placeholder="Create Password"
                  type="password"
                  autoComplete="off"
                  value={values.password ? values.password : ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password && touched.password ? 'text-input error' : 'text-input'
                  }
                />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>

              <Form.Item className="submit-btn">
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      }}
    </Formik>)
}

const TypesOfFilm = [
  { format: "VHS" },
  { format: "DVD" },
  { format: "Blu-Ray" },
]

function LandingPage(props) {

  const [FilmsFromServer, setFilmsFromServer] = useState([]);
  const [ShowFilms, setShowFilms] = useState([])
  const [ShowStar, setShowStar] = useState("");
  const [ShowName, setShowName] = useState("");
  const [SortByName, setSortByName] = useState(0);
  const [ShowOnlyMine, setShowOnlyMine] = useState(false);
  let redux = useSelector(state => state.redux);
  const UserId = redux?.userData?._id


  useEffect(() => {

    getFilms()
  }, [])


  useEffect(() => {
    let newShowArray = JSON.parse(JSON.stringify(FilmsFromServer));
    if (ShowName) {
      newShowArray = newShowArray.filter(function (elem) {
        return elem.title.toLowerCase().indexOf(ShowName.toLowerCase()) != -1;
      });
    }
    if (ShowStar) {
      let ChangeShowArray = [];
      for (let elm = 0; elm < newShowArray.length; elm++) {
        let l = 0;
        for (let ooo = 0; ooo < newShowArray[elm].stars.length; ooo++) {
          if (newShowArray[elm].stars[ooo].toLowerCase().indexOf(ShowStar.toLowerCase()) != -1)
            l = 1
        }
        if (l === 1)
          ChangeShowArray.push(newShowArray[elm])
      }
      newShowArray = ChangeShowArray
    }
    if (ShowOnlyMine) {
      let ChangeShowArray = [];
      for (let elm = 0; elm < newShowArray.length; elm++) {
        if (newShowArray[elm].writer._id === UserId)
          ChangeShowArray.push(newShowArray[elm])
      }
      newShowArray = ChangeShowArray
    }
    if (SortByName === 1) {
      newShowArray.sort((a, b) => (a.title.toUpperCase() > b.title.toUpperCase()) ? 1 : (a.title.toUpperCase() === b.title.toUpperCase()) ? 0 : -1)
    }

    if (SortByName === -1) {
      newShowArray.sort((a, b) => (a.title.toUpperCase() > b.title.toUpperCase()) ? -1 : (a.title.toUpperCase() === b.title.toUpperCase()) ? 0 : 1)
    }

    setShowFilms(newShowArray)

  }, [redux, ShowOnlyMine, SortByName, ShowName, ShowStar])

  const getFilms = () => {
    axios.post(`${FILM_SERVER}/films`)
      .then(response => {
        setFilmsFromServer(response.data.films)
        setShowFilms(response.data.films)
      })
  }

  const setSorting = () => {
    if (SortByName === 0) {
      setSortByName(1)
    }
    else if (SortByName === 1) {
      setSortByName(-1)
    }
    else
      setSortByName(0)

  }

  return (
    <div className="landing-page">
      <div className="landing-page-control">
        <button onClick={() => setShowOnlyMine(!ShowOnlyMine)}>{ShowOnlyMine ? "Show all" : "Show only mine"}</button>
        <button onClick={() => setSorting()}>{SortByName === -1 ? "Don`t sort by title" : SortByName === 0 ? "Sort title by asc order" : "Sort  title by desc order"}</button>
        <input placeholder="star" value={ShowStar} onChange={(e) => setShowStar(e.target.value)}></input>
        <input placeholder="title" value={ShowName} onChange={(e) => setShowName(e.target.value)}></input>

      </div>
      <div className="mapofFilms">
        {
          ShowFilms.map((film, index) => <div key={index} className="filmCard">
            <div className="filmCardTitle">{film.title}</div>
            <div className="filmCardYear">{film.year}</div>
            <div className="filmCardFormat">{film.format}</div>
            <ul className="filmCardStars">{film.stars.map((star, starindex) => <li key={starindex + "_" + index}>{star}</li>)}</ul>
            {film?.writer?._id === redux?.userData?._id && <div className="editBtnBlock"><Link className="filmCardEdit" to={"/film/" + film._id}>Edit</Link></div>}
          </div>)
        }
        {
          !ShowFilms.length && <div className="no_movies_found">
              <div className="no_movies_found_title">
                no movies found
              </div>
              <Link to="/upload">
                add movies
              </Link>
            </div> 
        }
      </div>
    </div>
  )
}
function FileUpload(props) {
  const [InnerFile, setInnerFile] = useState('')
  const [MainObj, setMainObj] = useState([])
  const [ErrorFile, setErrorFile] = useState("")
  const [SuccesFile, setSuccesFile] = useState("")

  useEffect(() => {
    let textstart = InnerFile.split("\n")
    let arrwithstrs = textstart.filter(str => {
      if (str.trim().length)
        return str.trim();
      return null;
    });
    let sendObj = [];
    let error = "";
    if (arrwithstrs.length % 4 !== 0 || arrwithstrs.length === 0) {
      error = "Wrong row count";
    }
    else
      for (var x = 0; x < arrwithstrs.length; x++) {
        var ObjectForSend = {};
        if (x % 4 === 0) {
          if (arrwithstrs[x].indexOf('Title:') === 0) {
            if (arrwithstrs[x].trim().length > 'Title:'.length)
              ObjectForSend.title = arrwithstrs[x].substr('Title:'.length, arrwithstrs[x].length).trim();
            else
              error = "Title is empty somewhere";
          }
          else
            error = "Title are not set somewhere";
          x++;
        }
        if (x % 4 === 1) {
          if (arrwithstrs[x].indexOf('Release Year:') === 0) {
            if (arrwithstrs[x].length > 'Release Year:'.length) {
              if (Number.isInteger(Number(arrwithstrs[x].substr('Release Year:'.length, arrwithstrs[x].length).trim())) &&
                arrwithstrs[x].substr('Release Year:'.length, arrwithstrs[x].length).trim())
                if (((new Date()).getFullYear() >= Number(arrwithstrs[x].substr('Release Year:'.length, arrwithstrs[x].length).trim())) && (Number(arrwithstrs[x].substr('Release Year:'.length, arrwithstrs[x].length).trim()) >= 1850))
                  ObjectForSend.year = arrwithstrs[x].substr('Release Year:'.length, arrwithstrs[x].length).trim();
                else 
                  error = "Wrong year";
              else
                error = "Release Year is not a number somewhere";
            }
            else
              error = "Release Year are empty somewhere";
          }
          else
            error = "Release Year are not set somewhere";
          x++;
        }
        if (x % 4 === 2) {
          if (arrwithstrs[x].indexOf('Format:') === 0) {
            let format = arrwithstrs[x].substr('Format:'.length, arrwithstrs[x].length).trim();
            if (format === "DVD" || format === "VHS" || format === "Blu-Ray")
              ObjectForSend.format = arrwithstrs[x].substr('Format:'.length, arrwithstrs[x].length).trim();
            else
              error = "Format is not right somewhere";
          }
          else
            error = "Format are not set somewhere";
          x++
        }
        if (x % 4 === 3) {
          if (arrwithstrs[x].indexOf("Stars:") === 0) {
            var stararr = arrwithstrs[x].trim().substr("Stars:".length, arrwithstrs[x].length).split(',');

            for (let a = 0; a < stararr.length; a++)
              stararr[a] = stararr[a].trim();
            if (stararr.indexOf("") != -1)
              error = "Stars are not set somewhere";
            for (let a = 0; a < stararr.length; a++)
              if (stararr[a].match(regex))
                error = "Stars has bad chars somewhere";
            for (let gg = 0; gg< stararr.length; gg++){
              for (let ff = 0; ff< stararr.length; ff++){
                if (stararr[gg].trim() === stararr[ff].trim() && ff!==gg){
                  error = "Somewhere stars the same"
                }
              } 
            }
            if (arrwithstrs[x].trim().substr("Stars:", arrwithstrs[x].length).trim().length > 0)
              ObjectForSend.stars = stararr;
            else
              error = "Stars are not set somewhere";
          }
          else
            error = "Stars are not set somewhere";

          if (Object.keys(ObjectForSend).length === 4) {
            ObjectForSend.writer = props.userId
            sendObj.push(ObjectForSend);
          }
          if (error === "" && x + 1 === arrwithstrs.length) {
            setMainObj(sendObj)
            setSuccesFile("All ok")
            setErrorFile("")
          }
          else if (error) {
            setErrorFile(error)
            setSuccesFile("")
            setMainObj([])

          }
        }
      }
  }, [InnerFile])

  const onDrop = (files) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      setInnerFile(e.target.result)
    };

    reader.readAsText(files[0]);
  }

  const uploadFile = () => {
    axios.post(`${FILM_SERVER}/upload/films`, MainObj)
      .then(res => {
        alert(res.data.toString())
        setSuccesFile("")
        setErrorFile("")
      })
  }
  return (
    <>
      <div className="image-uploader" >
        {
          SuccesFile &&
          <div className="AllOkUpload">
            {SuccesFile}
          </div>
        }
        {
          ErrorFile &&
          <div className="ErrorUpload">
            {ErrorFile}
          </div>
        }
        <Dropzone
          onDrop={onDrop}
          multiple={false}
          maxSize={800000000}
        >
          {({ getRootProps, getInputProps }) => (
            <div className="dropzone"
              {...getRootProps()}
            >
              <input {...getInputProps()} />
              <Icon type="plus" style={{ fontSize: '3rem' }} />

            </div>
          )}
        </Dropzone>
        {SuccesFile &&
          <button className="submit_file" onClick={() => uploadFile()}>
            submit file
                </button>
        }
      </div>

    </>
  )
}
function UploadFilmPage(props) {

  const [Title, setTitle] = useState("")
  const [Year, setYear] = useState(0);
  const [Format, setFormat] = useState("VHS")
  const [Stars, setStars] = useState([])

  const onSubmit = (event) => {

    if (!Title || !Year || !Format ||
      Stars.length === 0) {
      return alert('Fill all the fields first!')
    }
    if ((new Date()).getFullYear() < parseInt(Year) || parseInt(Year) < 1850) {
      return alert('Year isn`t correct')
    }
    if (Title.trim().match(regex)) {
      return alert('Title bad')
    }
    const variables = {
      writer: props.redux.userData._id,
      title: Title,
      year: Year,
      format: Format,
      stars: Stars
    }
    axios.post(`${FILM_SERVER}/upload/film`, variables)
      .then(response => {
        if (response.data.success) {
          alert('Film Successfully Uploaded')
          setTitle("")
          setYear(0)
          setStars([])
        } else {
          alert('Failed to upload Film')
        }
      })


  }
  const [StarInput, setStarInput] = useState("")
  const [Important, setImportant] = useState(false)
  const addStarToArr = () => {
    if(Stars.indexOf(StarInput.trim()) !== -1)
      alert("This star exist");
    else if (StarInput.trim().match(regex))
      alert("Star has bad chars somewhere");
    else if (StarInput.trim().length > 0)
      setStars([...Stars, StarInput.trim()])
    setStarInput("")

  }
  const deleteStar = (star) => {
    let newStars = Stars
    newStars.splice(star, 1);
    setImportant(!Important)
    return newStars
  }



  return (
    <div className="upload-product">
      <h2 className="upload-logo">Uploading</h2>
      <FileUpload userId={props?.redux?.userData?._id} />

      <Form className="upload-form" >

        <div className="upload-input">
          <label>Title</label>
          <Input
            onChange={(e) => setTitle(e.target.value)}
            value={Title}
          />
        </div>
        <div className="upload-input">

          <label>Year</label>
          <Input
            onChange={(e) => setYear(e.target.value)}
            value={Year === 0 ? "" : Year}
            type="number"
          />
        </div>
        <div className="upload-input">

          <label>Format</label>
          <select onChange={(e) => setFormat(e.target.value)} value={Format}>
            {TypesOfFilm.map(item => (
              <option key={item.format} value={item.format}>{item.format} </option>
            ))}
          </select>
        </div>
        <div className="upload-input">

          <label>Stars</label>
          <div className="star-input"><Input
            onChange={(e) => setStarInput(e.target.value)}
            value={StarInput}
          />
            <button onClick={() => addStarToArr()}>add</button>
          </div>

        </div>
        <div className="starsMap">
          {Stars.map((star, index) => <div className="starRow" key={index + Math.random()}>
            <div>{star}</div>
            <button onClick={() => { setStars(deleteStar(index)) }}>X</button>
          </div>)}
        </div>
        <Button type="submit" className="submit-upload-btn"
          onClick={() => onSubmit()}
        >

          upload movie
                </Button>

      </Form>
    </div>


  )
}

function FilmPage(props) {
  let redux = useSelector(state => state.redux);

  const filmId = props.match.params.filmId

  const [Film, setFilm] = useState([])
  const [Title, setTitle] = useState("")
  const [Year, setYear] = useState("")
  const [Format, setFormat] = useState("VHS")
  const [Stars, setStars] = useState([])
  const [StarInput, setStarInput] = useState("")


  useEffect(() => {
    updatePage()

  }, [redux])
  useEffect(() => {
    setTitle(Film.title)
    setYear(Film.year)
    setFormat(Film.format)
    setStars(Film.stars)
    setStarInput("");
  }, [Film])
  const addStarToArr = () => {
    if(Stars.indexOf(StarInput.trim()) !== -1)
    alert("This star exist");
  else if (StarInput.trim().match(regex))
    alert("Star has bad chars somewhere");
  else if (StarInput.trim().length > 0)
    setStars([...Stars, StarInput.trim()])
  setStarInput("")

  }
  const updatePage = () => {
    let variables = {
      filmId: filmId,

    }
    if (redux?.userData?._id)
      axios.post(`${FILM_SERVER}/getfilm`, variables)
        .then(response => {
          if (redux?.userData?._id === response?.data[0]?.writer._id) {
            setFilm(response.data[0])
          }
          else {
            props.history.push('/')
          }
        })
  }

  const onSubmit = () => {
    const variables = {
      _id: Film._id,
      writer: Film.writer._id,
      title: Title,
      year: Year,
      format: Format,
      stars: Stars
    }
    if (!Title || !Year || !Format ||
      Stars.length === 0) {
      return alert('Fill all the fields first!')
    }
    if  ((new Date()).getFullYear() < parseInt(Year) || parseInt(Year) < 1850) {
      return alert('Year isn`t correct')
    }
    if (Title.trim().match(regex)) {
      return alert('Title bad')
    }
    axios.post(`${FILM_SERVER}/update/film/${filmId}`, variables)
      .then(response => {
        alert(response.data.message)
        if (response?.data?.data)
          setFilm(response.data.data)
      })


  }
  const [Important, setImportant] = useState(false)

  const deleteStar = (star) => {
    let newStars = Stars
    newStars.splice(star, 1);
    setImportant(!Important)
    return newStars
  }
  const onDelete = () => {
    if(window.confirm("Are you sure?"))
    axios.delete(`${FILM_SERVER}/delete/film/${filmId}`)
      .then(response => {
        alert(response.data.message)
        if (response?.data?.success)
          props.history.push('/')

      })
  }
  return (
    <div className="upload-product">
      <h2 className="upload-logo">Film editing</h2>

      <Form className="upload-form" >

        <div className="upload-input">
          <label>Title</label>
          <Input
            onChange={(e) => setTitle(e.target.value)}
            value={Title}
          />
        </div>
        <div className="upload-input">

          <label>Year</label>
          <Input
            onChange={(e) => setYear(e.target.value)}
            value={Year === 0 ? "" : Year}
            type="number"
          />
        </div>
        <div className="upload-input">

          <label>Format</label>
          <select onChange={(e) => setFormat(e.target.value)} value={Format}>
            {TypesOfFilm.map(item => (
              <option key={item.format} value={item.format}>{item.format} </option>
            ))}
          </select>
        </div>
        <div className="upload-input">

          <label>Stars</label>
          <div className="star-input"><Input
            onChange={(e) => setStarInput(e.target.value)}
            value={StarInput}
          />
            <button onClick={() => addStarToArr()}>add</button>
          </div>

        </div>
        <div className="starsMap">
          {Stars && Stars.map((star, index) => <div className="starRow" key={index + Math.random()}>
            <div>{star}</div>
            <button onClick={() => { setStars(deleteStar(index)) }}>X</button>
          </div>)}

        </div>


        <Button type="submit" className="submit-upload-btn"
          onClick={() => onSubmit()}
        >
          Submit
              </Button>
        <Button type="submit" className="submit-upload-btn"
          onClick={() => onDelete()}
        >
          Delete
              </Button>
      </Form>
    </div>
  )

}





function changePassword(dataToSubmit) {
  return axios.post(`${USER_SERVER}/changePassword`, dataToSubmit)
    .then(response => response.data);
}

function SettingsPage(props) {
  let redux = useSelector(state => state.redux);
  const [Films, setFilms] = useState([])
  const [FilmsInput, setFilmsInput] = useState("")

  const rmrfFilm = (idid) => {
    if(window.confirm("Are you sure?"))
    axios.delete(`${FILM_SERVER}/delete/film/${idid}`).then(response => {
      if (response.data.success) {
        alert(response.data.message)
        getUserFilms()
      }
      else {
        alert(response.data.message)
      }
    })
  }

  const getUserFilms = () => {
    if (redux?.userData?._id) {
      axios.post(`${FILM_SERVER}/films`).then((res) => {
        let films = res.data.films.filter(film => film.writer._id === redux.userData._id)

        if (FilmsInput)
          films.filter(film => film.title === FilmsInput)
        setFilms(films)
      }
      )
    }

  }
  const deleteAccount = () => {
    if(window.confirm("Are you sure?"))
    axios.delete(`${USER_SERVER}/delete/acc`).then(response => {
      if (response.data.success) {
        alert(response.data.message)
        props.history.push("/login");
      }
      else {
        alert(response.data.message)
      }
    })
  }
  useEffect(() => {
    getUserFilms()
  }, [redux, FilmsInput])

  return (

    <Formik
      initialValues={{
        password: '',
        confirmPassword: ''
      }}
      validationSchema={Yup.object().shape({
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          let dataToSubmit = {
            id: redux.userData._id,
            password: values.password,
          };
          changePassword(dataToSubmit).then(response => {
            alert("changed")
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
        } = props;
        return (
          <div className="settings-app">
            <h2>Settings of user</h2>
            <div className="settings_user-name">{redux?.userData?.name} | {redux?.userData?.email}</div>
            <h4>Change Password</h4>

            <Form autoComplete="off" className="register-form" onSubmit={handleSubmit} >
              <Form.Item required className={errors.password && touched.password ? "form-item error" : "form-item"} label="Password">
                <Input
                  id="password"
                  autoComplete="new-password"
                  placeholder="Create Password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password && touched.password ? 'text-input error' : 'text-input'
                  }
                />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>

              <Form.Item required className={errors.confirmPassword && touched.confirmPassword ? "form-item error" : "form-item"} label="Confirm Password">
                <Input
                  id="confirmPassword"
                  placeholder="Submit Password"
                  type="password"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input'
                  }
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="input-feedback">{errors.confirmPassword}</div>
                )}
              </Form.Item>

              <Form.Item className="submit-btn">
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
            <div className="delete-btn-row">
              <button onClick={() => deleteAccount()}>Delete Account</button>
            </div>
            <h4 className="logo-setttings-delete-logo">Delete Your films</h4>

            <div className="deleteBtns">
              <input placeholder="Find film for delete" value={FilmsInput} onChange={(e) => setFilmsInput(e.target.value)} />
              {Films.map((item, index) => <div className="delete-row" key={index}>
                <div>{item.title}</div>
                <button onClick={() => rmrfFilm(item._id)}>
                  X
  </button>
              </div>)}
             
            </div>
          </div>
        );
      }}
    </Formik>
  );
};


function App(props) {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
        <Route path="/" component={NavBar} />

      <div className="main-div" >
        <Switch>
          <Route exact path="/" component={Auth(LandingPage, true)} />
          <Route exact path="/signup" component={Auth(RegisterPage, false)} />
          <Route exact path="/login" component={Auth(LoginPage, false)} />
          <Route exact path="/upload" component={Auth(UploadFilmPage, true)} />
          <Route exact path="/film/:filmId" component={Auth(FilmPage, true)} />
          <Route exact path="/settings" component={Auth(SettingsPage, true)} />
          <Route path='*' exact={true} component={Auth(LandingPage, true)} />
        </Switch>
      </div>

    </Suspense>
  );
}



ReactDOM.render(
  <Provider
    store={createStoreWithMiddleware(
      rootReducer,
      window.__REDUX_DEVTOOLS_EXTENSION__ &&
      window.__REDUX_DEVTOOLS_EXTENSION__()
    )}
  >
    <BrowserRouter>
      <Switch>
        <Route path="/" component={App} />
      </Switch>
    </BrowserRouter>
  </Provider>
  , document.getElementById('root'));
serviceWorker.unregister();