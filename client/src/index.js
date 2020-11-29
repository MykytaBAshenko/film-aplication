import React, { Suspense,useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter, Route, Switch, Link } from "react-router-dom";
import { Provider, useSelector, useDispatch } from 'react-redux';
import { createStore, applyMiddleware, combineReducers  } from 'redux';
import promiseMiddleware from 'redux-promise';
import ReduxThunk from 'redux-thunk';
import { Icon } from 'antd';
import axios from 'axios';
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup';
import Dropzone from 'react-dropzone';

import {
  Form,
  Input,
  Button,
} from 'antd';

const config = {
  MAGIC_HOST: ""
};

if (process.env.NODE_ENV === 'production') {
  config.MAGIC_HOST=window.location.origin
} else {
  config.MAGIC_HOST='http://localhost:5000';
}
axios.defaults.baseURL = config.MAGIC_HOST
axios.defaults. withCredentials= true
let allow_in1sec = 1;
setInterval(() => {
    allow_in1sec = 1;
}, 30);

const LOGIN_USER = 'login_user';
const REGISTER_USER = 'register_user';
const AUTH_USER = 'auth_user';
const LOGOUT_USER = 'logout_user';

const USER_SERVER = '/api/users';
const FILM_SERVER = '/api/film';



 function redux (state = {}, action) {

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

// user_actions


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






function Auth (ComposedClass, reload, adminRoute = null) {
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
          
      }, [dispatch, props.history, redux.googleAuth])

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
  return(
    <>
<div className="">
  <div className="yellow-line">
    <nav className="navbar   navbar-expand-lg ">
  <a href="/" className="navbar-brand">GunstaSHOP</a>
  <button className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
    <i className="fas fa-bars"></i>
  </button>
  <div className="collapse navbar-collapse" id="navbarCollapse">
      {((redux.userData && !redux.userData.isAuth )) ?
       <ul className="navbar-nav ml-auto">
        <li className="navbar-item">
          <a href="/login" className="nav-link">Signin</a>
        </li>
        <li className="navbar-item">
          <a href="/register" className="nav-link">Signup</a>
        </li>
      </ul>
      :
      <ul className="navbar-nav ml-auto">
        <li className="navbar-item">
          <a href="/" className="nav-link">Films</a>
        </li>
        <li className="navbar-item">
          <Link to="/upload" className="nav-link">Upload</Link>
        </li>
        <li className="navbar-item">
          <a href="/settings" className="nav-link">Settings</a>
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
            image: `http://gravatar.com/avatar/${moment().unix()}?d=identicon`
          };
          dispatch(registerUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
              props.history.push("/login");
            } else {
              alert(response.payload.err.errmsg)
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
          dirty,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          handleReset,
        } = props;
        return (
          <div className="register-form-app">
            <h2>Sign up</h2>
            <Form autoComplete="off" className="register-form" onSubmit={handleSubmit} >

              <Form.Item required className={errors.name && touched.name ?"form-item error" : "form-item"} label="Name">
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
              <Form.Item required className={errors.email && touched.email ?"form-item error" : "form-item"} label="Email">
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
              <Form.Item required className={errors.password && touched.password ?"form-item error" : "form-item"} label="Password">
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

              <Form.Item required className={errors.confirmPassword && touched.confirmPassword ?"form-item error" : "form-item"} label="Confirm Password">
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
                setFormErrorMessage('Check out your Account or Password again')
              }
            })
            .catch(err => {
              setFormErrorMessage('Check out your Account or Password again')
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
            <Form autoComplete="off"   className="register-form" onSubmit={handleSubmit} >
              <Form.Item autoComplete="new-password" required className={errors.email && touched.email ?"form-item error" : "form-item"} label="Email">
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
              <Form.Item autoComplete="new-password" autoComplete="off"  required className={errors.password && touched.password ?"form-item error" : "form-item"} label="Password">
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
  {  format: "VHS" },
  {  format: "DVD" },
  { format: "Blu-Ray" },
]
const SortBye = [
  { sby: 0, value: "Default" },
  { sby: 1, value: "From cheap to expensive" },
  { sby: 2, value: "From expensive to cheap" },
]
function LandingPage(props) {

const [FilmsFromServer,setFilmsFromServer] = useState([]);
const [ShowFilms, setShowFilms] = useState([])
const [ShowStar, setShowStar] = useState("");
const [ShowName, setShowName] = useState("");
const [SortByName, setSortByName] = useState(false);
const [ShowOnlyMine,setShowOnlyMine] = useState(false);
let redux = useSelector(state => state.redux);
const UserId = redux?.userData?._id


useEffect(() => {

      getFilms()
  }, [])


let ll = 0;
useEffect(() => {
  let newShowArray =JSON.parse(JSON.stringify(FilmsFromServer));
  if(ShowName){
    newShowArray =  newShowArray.filter(function(elem) {
      return elem.title.toLowerCase().indexOf(ShowName.toLowerCase()) != -1;
  });
  }
  if(ShowStar){
    let ChangeShowArray = [];
    for(let elm = 0; elm < newShowArray.length; elm++ ){
      let l = 0;
      for(let ooo = 0; ooo < newShowArray[elm].stars.length; ooo++){
        if(newShowArray[elm].stars[ooo].toLowerCase().indexOf(ShowStar.toLowerCase()) != -1)
        l = 1
      }
      if(l === 1)
      ChangeShowArray.push(newShowArray[elm])
    }
    newShowArray = ChangeShowArray
  }
  if(ShowOnlyMine){
    let ChangeShowArray = [];
    for(let elm = 0; elm < newShowArray.length; elm++ ){
      if(newShowArray[elm].writer._id === UserId)
      ChangeShowArray.push(newShowArray[elm])
    }
    newShowArray = ChangeShowArray
  }
  if(SortByName){

    newShowArray.sort((a, b) => (a.title.toUpperCase() > b.title.toUpperCase()) ? 1 : (a.title.toUpperCase() === b.title.toUpperCase()) ?0 : -1 )
  }
  
  setShowFilms(newShowArray)
}, [redux,ShowOnlyMine,SortByName, ShowName, ShowStar])

const getFilms = () => {
  axios.post(`${FILM_SERVER}/films`)
      .then(response => {
          setFilmsFromServer(response.data.films) 
          setShowFilms(response.data.films) 
      })
}

  return(
    <div className="main-page-store-shell">
      <input placeholder="star" value={ShowStar} onChange={(e) => setShowStar(e.target.value)}></input>
      <input placeholder="title" value={ShowName} onChange={(e) => setShowName(e.target.value)}></input>
      <button onClick={() => setShowOnlyMine(!ShowOnlyMine)}>{ShowOnlyMine ?  "Show all" :  "Show only mine"}</button>
      <button onClick={() => setSortByName(!SortByName)}>{SortByName ?  "Don`t sort by title" :  "Sort by title"}</button>
      <div className="mapofFilms">
        {
          ShowFilms.map((film, index) => <div key={index} className="filmCard">
            <div className="filmCardTitle">{film.title}</div>
            <div className="filmCardYear">{film.year}</div>
            <div className="filmCardFormat">{film.format}</div>
        <ul className="filmCardStars">{film.stars.map((star, starindex) => <li key={starindex+ "_"+ index}>{star}</li>)}</ul>
         {film?.writer?._id == redux?.userData?._id && <Link to={"/film/"+film._id}>Edit</Link>}

          </div>)
        }

      </div>
 
    </div>
  )
}
const regex = /[.*+?^${}()|[\]\\]/g
function FileUpload(props) {
  const [InnerFile, setInnerFile] = useState('')
  const [MainObj, setMainObj] = useState([])
  const [ErrorFile, setErrorFile] = useState("")
  const [SuccesFile, setSuccesFile] = useState("")
  const [SuccesUpload, setSuccesUpload] = useState("")

  useEffect(() => {
    let textstart = InnerFile.split("\n")
    let arrwithstrs = textstart.filter(str => {
      if (str.trim().length)
          return str.trim();
      return null;
    });
    console.log(arrwithstrs)
    let sendObj = [];
    let error ="";
    if(arrwithstrs.length % 4 != 0 || arrwithstrs.length == 0){
      error = "Wrong row count";
  console.log(arrwithstrs,arrwithstrs.length % 4 != 0,arrwithstrs.length == 0 )  
  }
    else
      for (var x = 0; x < arrwithstrs.length; x++) {
        var ObjectForSend = {};
        if(x % 4 === 0){
            if(arrwithstrs[x].indexOf('Title:') === 0){
                if(arrwithstrs[x].trim().length > 'Title:'.length)
                    ObjectForSend.title = arrwithstrs[x].substr('Title:'.length,arrwithstrs[x].length).trim();
                else
                error =  "Title is empty somewhere";
            }
            else
            error =  "Title are not set somewhere";
            x++;
        }
        if(x % 4 === 1){
            if(arrwithstrs[x].indexOf('Release Year:') === 0){
                if(arrwithstrs[x].length > 'Release Year:'.length){
                    if (Number.isInteger(Number(arrwithstrs[x].substr('Release Year:'.length, arrwithstrs[x].length).trim())) &&
                        arrwithstrs[x].substr('Release Year:'.length, arrwithstrs[x].length).trim())
                            ObjectForSend.year = arrwithstrs[x].substr('Release Year:'.length, arrwithstrs[x].length).trim();
                    else
                    error =  "Release Year is not a number somewhere";
                }
                else
                error = "Release Year are empty somewhere";
            }
            else
            error = "Release Year are not set somewhere";
            x++;
        }
        if (x % 4 === 2){
          if ( arrwithstrs[x].indexOf('Format:') === 0) {
              let format =arrwithstrs[x].substr('Format:'.length, arrwithstrs[x].length).trim();
                  if (format === "DVD" || format === "VHS" || format === "Blu-Ray")
                      ObjectForSend.format = arrwithstrs[x].substr('Format:'.length, arrwithstrs[x].length).trim();
                  else
                      error = "Format is not right somewhere";
          }
          else
            error = "Format are not set somewhere";
          x++
      }
      if (x % 4 === 3){
        if(arrwithstrs[x].indexOf("Stars:") === 0) {
            var stararr = arrwithstrs[x].trim().substr("Stars:".length,arrwithstrs[x].length).split(',');
            
            for(let a = 0; a < stararr.length; a++)
                stararr[a] = stararr[a].trim();
            if (stararr.indexOf("") != -1)
              error = "Stars are not set somewhere";
              for(let a = 0; a < stararr.length; a++)
                if(stararr[a].match(regex))
                  error = "Stars has bad chars somewhere";

            
            if(arrwithstrs[x].trim().substr("Stars:",arrwithstrs[x].length).trim().length > 0)
                ObjectForSend.stars = stararr;
            else 
                 error = "Stars are not set somewhere";
        }
        else 
        error = "Stars are not set somewhere";
    
    if (Object.keys(ObjectForSend).length === 4){
      ObjectForSend.writer = props.userId
      sendObj.push(ObjectForSend);
    }
    if(error === "" && x + 1 === arrwithstrs.length ) {
        setMainObj(sendObj)
        setSuccesFile("All ok")
        setErrorFile("")
    }
    else if(error){
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
    axios.post(`${FILM_SERVER}/upload/films`,MainObj)
    .then(res => setSuccesUpload (res.data.toString()))
}
  return (
    <>
      <div className="image-uploader" >
        {
          SuccesFile &&
        <div>
          {SuccesFile}
        </div>
}
{
          ErrorFile &&
        <div>
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
                <button onClick={() => uploadFile()}>
asd
                </button>
}
      </div>
     
    </>
  )
}
function UploadProductPage(props) {

    const [Title, setTitle] = useState("")
    const [Year, setYear] = useState(0);
    const [Format, setFormat] = useState("VHS")
    const [Stars, setStars] = useState([])

    const onSubmit = (event) => {
      // event.preventDefault();
      console.log(Title, Year, Format, Stars, (new Date()).getFullYear())

      if (!Title || !Year  || !Format ||
          Stars.length == 0 ) {
          return alert('Fill all the fields first!')
      }
      if((new Date()).getFullYear() >= Year&& Year <= 1850){
        return alert('Year isn`t correct')
      }
      const variables = {
          writer: props.redux.userData._id,
          title: Title,
          year: Year,
          format: Format,
          stars: Stars
      }
      axios.post(`${FILM_SERVER}/upload/film`,variables)
          .then(response => {
              if (response.data.success) {
                  alert('Product Successfully Uploaded')
                  // props.history.push('/')
              } else {
                  alert('Failed to upload Product')
              }
          })


  }
  const [StarInput, setStarInput] = useState("")
  const [Important, setImportant] =useState(false)
  const addStarToArr =() => {
    
    if(StarInput.trim().match(regex))
      alert ( "Star has bad chars somewhere");
    if(StarInput.trim().length> 0){
    setStars([...Stars,StarInput.trim()])
      setStarInput("")
     

  }
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
                    value={Year == 0 ? "" : Year}
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
                      <Input 
                      onChange={(e) => setStarInput(e.target.value)}
                      value={StarInput}
                      />
                </div>
                <button onClick={() => addStarToArr()}>add</button>
                    <div >
                      {Stars.map((star, index) => <div key={index+Math.random()}>
                      <div>{star}</div>
                      <button onClick={() => {setStars( deleteStar(index)) }}>X</button>
                      </div>)}
                    </div>
                <Button type="submit" className="submit-upload-btn"
                    onClick={() => onSubmit()}
                >
                    Submit
                </Button>

            </Form>
    </div>
    

  )
}

function My404Component(){
  return<div className="My404Component">
    <div>404</div>
    <a href="/">Back to home page</a>
  </div>
}

function FilmPage(props){
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
  const addStarToArr =() => {
    
    if(StarInput.trim().match(regex))
      alert ( "Star has bad chars somewhere");
    if(StarInput.trim().length> 0){
    setStars([...Stars,StarInput.trim()])
      setStarInput("")
     

  }
  setStarInput("")

  }
  const updatePage = () => {
    let variables = {
      filmId: filmId,

    }
    if(redux?.userData?._id)
    axios.post(`${FILM_SERVER}/getfilm`,variables)
        .then(response => {
          if(redux?.userData?._id == response?.data[0]?.writer._id){
          setFilm(response.data[0])
          console.log(response.data[0])
          }
          else{
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
  console.log(variables)
  axios.post(`${FILM_SERVER}/update/film/${filmId}`, variables)
  .then(response => {
    alert(response.data.message)
    if(response?.data?.data)
    setFilm(response.data.data)
  })
      

  }
  const [Important, setImportant] =useState(false)

  const deleteStar = (star) => {
    let newStars = Stars
    newStars.splice(star, 1);
    setImportant(!Important)
    return newStars
  }
  const onDelete = () => {
    axios.delete(`${FILM_SERVER}/delete/film/${filmId}`)
  .then(response => {
    alert(response.data.message)
    if(response?.data?.success)
    props.history.push('/')

  })
  }
  return (
    <div className="upload-product">
    <h2 className="upload-logo">Uploading</h2>

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
                  value={Year == 0 ? "" : Year}
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
                    <Input 
                    onChange={(e) => setStarInput(e.target.value)}
                    value={StarInput}
                    />
              </div>
              <button onClick={() => addStarToArr()}>add</button>
                  <div >
                    {Stars?.map((star, index) => <div key={index+Math.random()}>
                    <div>{star}</div>
                    <button onClick={() => {setStars( deleteStar(index)) }}>X</button>
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
  return  axios.post(`${USER_SERVER}/changePassword`, dataToSubmit)
      .then(response => response.data);
}

function SettingsPage (props) {
  let redux = useSelector(state => state.redux);
  const [Films, setFilms] = useState([])
  const [FilmsInput, setFilmsInput] = useState("")

  // const rmrfFromProducts = (idid) => {
  //   axios.get(`${FILM_SERVER}/rmrfProduct?userId=${redux.userData._id}&productId=${idid}`).then(response => {
  //     setProducts(response.data)
  // })
  // }

  const getUserProducts = () => {
    axios.post(`${FILM_SERVER}/films`).then((res) => {
      if(redux?.userData?._id)
      {

      let films = res.data.films.filter(film => film.writer._id == redux.userData._id)

      if(FilmsInput)
        films.filter(film => film.title == FilmsInput)
      console.log(films)
      setFilms(films)
      // setFilmsInput("")
      }
  }
    )
  } 

  useEffect(() => {
    getUserProducts()
  }, [redux,FilmsInput])

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
          dirty,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
          handleReset,
        } = props;
        return (
          <div className="settings-app">
            <h2>Settings</h2>
            <h4>Change Password</h4>

            <Form autoComplete="off" className="register-form" onSubmit={handleSubmit} >
              <Form.Item required className={errors.password && touched.password ?"form-item error" : "form-item"} label="Password">
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

              <Form.Item required className={errors.confirmPassword && touched.confirmPassword ?"form-item error" : "form-item"} label="Confirm Password">
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
            <h4 className="logo-setttings-delete-logo">Delete Your Products</h4>

            <div className="deleteBtns">
              <input placeholder="Find your product" value={FilmsInput}  onChange={(e) =>  setFilmsInput(e.target.value)} />
              {Films.map((item, index) => <div className="delete-row" key={index}>
                {/* <div>{item.title}</div>
<button onClick={() => rmrfFromProducts(item._id)}>
  X
  </button>                 */}
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
      
      <div className="main-div" style={{  minHeight: 'calc(100vh - 175px)' }}>
      <Route path="/" component= {NavBar} />
         <Switch>
          <Route exact path="/" component={Auth(LandingPage, true)} />
          <Route exact path="/register" component={Auth(RegisterPage, false)} />
          <Route exact path="/login" component={Auth(LoginPage, false)} />
          <Route exact path="/upload" component={Auth(UploadProductPage, true)} />
          <Route exact path="/film/:filmId" component={Auth(FilmPage, true)} />
          <Route exact path="/settings" component={Auth(SettingsPage, true)} />
          <Route path='*' exact={true} component={My404Component} />
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
        <Route  path="/" component={App} />
      </Switch>
      </BrowserRouter>
  </Provider>
  , document.getElementById('root'));
serviceWorker.unregister();