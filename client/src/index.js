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
import PaypalExpressBtn from 'react-paypal-express-checkout';

import {
  Form,
  Input,
  Button,
} from 'antd';
import { set } from 'mongoose';
// import { set } from 'mongoose';
// import { settings } from 'cluster';
const config = {
  MAGIC_HOST: ""
};
const { TextArea } = Input;

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
const ADD_TO_CART_USER = 'add_to_cart_user';
const GET_CART_ITEMS_USER = 'get_cart_items_user';
const REMOVE_CART_ITEM_USER = 'remove_cart_item_user';
const ON_SUCCESS_BUY_USER = 'on_success_buy_user';
const LOAD_PRODUCTS = "load_products"
const USER_SERVER = '/api/users';
const FILM_SERVER = '/api/film';
const RMRF_FROM_CART = "RMRF_FROM_CART"
const RMRF_ALL_FROM_CART = "RMRF_ALL_FROM_CART"
const DECRISE_FROM_CART = "DECRISE_ALL_FROM_CART"


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
      case ADD_TO_CART_USER:
          return {
              ...state, userData:{...state.userData,cart: action.payload}

          }
      case GET_CART_ITEMS_USER:
          return {
              ...state, cartDetail: action.payload
          }
      case REMOVE_CART_ITEM_USER:
          return {
              ...state,
              cartDetail: action.payload.cartDetail,
              userData: {
                  ...state.userData,
                  cart: action.payload.cart
              }

          }
      case ON_SUCCESS_BUY_USER:
          return {
              ...state,
              userData: {
                  ...state.userData,
                  cart: action.payload.cart,
                  history: action.payload.history,
              }
          }
      case RMRF_FROM_CART:
        return {
          ...state, userData:{...state.userData,cart: action.payload.cart}
        }
      case RMRF_ALL_FROM_CART : 
      return {
        ...state, userData: {
          ...state.userData, cart: action.payload.cart
        }
      }
      case DECRISE_FROM_CART : 
      return {
        ...state, userData: {
          ...state.userData, cart: action.payload
        }
      }
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

function addToCart(_id) {
  const request = axios.get(`${USER_SERVER}/addToCart?productId=${_id}`)
      .then(response => response.data);

  return {
      type: ADD_TO_CART_USER,
      payload: request
  }
}

function cleanCart(_id) {
  const request = axios.get(`${USER_SERVER}/rmrfFromCart?_id=${_id}`)
      .then(response => response.data);
  return {
      type: RMRF_FROM_CART,
      payload: request
  }
}

function cleanAllCart() {
  const request = axios.get(`${USER_SERVER}/rmrfAllFromCart`)
      .then(response => response.data);
  return {
      type: RMRF_ALL_FROM_CART,
      payload: request
  }
}

function decriseFromCart(_id) {
  const request = axios.get(`${USER_SERVER}/decriseFromCart?productId=${_id}`)
      .then(response => response.data);
      console.log(request)
  return {
      type: DECRISE_FROM_CART,
      payload: request
  }
}



class Paypal extends React.Component {
  render() {
      const onSuccess = (payment) => {
          console.log("The payment was succeeded!", payment);
          this.props.onSuccess(payment);
      
      }

      const onCancel = (data) => {
          console.log('The payment was cancelled!', data);
      }

      const onError = (err) => {
          console.log("Error!", err);
      }

      let env = 'sandbox'; 
      let currency = 'USD'; 
      let total = this.props.toPay; 

      const client = {
          sandbox: 'AfyGTdb67AGvKUAa1kpLTn-s2ycDsk0t2oosnETXZzlBW22-Rzhhgntk7bj-0zDgZvMY3GkkLmwqLaYm',
          production: 'YOUR-PRODUCTION-APP-ID',
      }
     return (
          <PaypalExpressBtn
              env={env}
              client={client}
              currency={currency}
              total={total}
              onError={onError}
              onSuccess={onSuccess}
              onCancel={onCancel}
              style={{ 
                  size:'large',
                  color:'blue',
                  shape: 'rect',
                  label: 'checkout'
              }}
               />
      );
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

function HeaderCart(props){
  const dispatch = useDispatch()
  let redux = useSelector(state => state.redux);

  return(
    <div className="cart-header-block-shell" >
      <div className="cart-header-block">
      <div className="cart-header-block-buttons">
        <a className="cart-header-block-button" href="/cart">Buy</a>
        <a className="cart-header-block-button" onClick={() => dispatch(cleanAllCart())}>Clean</a>
        <div></div>
        <a className="cart-header-block-button" onClick={() => props.setCartVisib()}>X</a>
      </div>
      <div className="cart-header-block-list-start">
        {redux.userData.cart.length === 0 ? 
        <div className="Cart-is-empty">Cart is empty</div>:
        
        <div className="cart-header-block-list">
          {redux.userData.cart.map((cart,index) => 
            <div key={index} className="cart-header-block-list-element">
            <div id={"carouselProductControls"+index+index} className="carousel slide carousel-fade" data-ride="carousel">

            <div className="carousel-inner">
           { cart.productBody.images.map((image, index) => (
                                     <div key={index+image} className={`d-flex flex-wrap align-items-center align-content-center carousel-item ${index === 0 ? "active" : ""}`}>
                                         <img className="d-block my-auto mx-auto carusel-product-image" 
                                             src={(image.substring(0, 7) === 'uploads') ? `${config.MAGIC_HOST}/${image}` : `${image}`} alt="productImage" />
                                     </div>
                                 ))}
           { cart.productBody.images.length > 1 ? <>
           <a className="carousel-control carousel-control-prev" href={"#carouselProductControls"+index+index} role="button" data-slide="prev">
           <i className="fas fa-angle-left"></i>
           </a>
           <a className="carousel-control carousel-control-next" href={"#carouselProductControls"+index+index} role="button" data-slide="next">
           <i className="fas fa-angle-right"></i>
           </a>
           </> : null
         }
           </div>
           </div>
            <div className="cart-header-block-list-description">
          <div className="cart-header-block-list-description-name">{cart.productBody && cart.productBody.title}</div>
            </div>
            <div className="cart-header-block-list-actions">
              <div className="cart-header-block-list-count">{cart.quantity}</div>
              <div className="cart-header-block-list-add header-list-action" onClick={() => dispatch(addToCart(cart.id))}>+</div>
              <div className="cart-header-block-list-decr header-list-action" onClick={() =>  dispatch(decriseFromCart(cart.id))}>-</div>
              <div className="cart-header-block-list-remove header-list-action" onClick={() => dispatch(cleanCart(cart.id))}><i className="fa fa-trash"></i></div>
            </div>
          </div>
          )}
        </div>

}
      </div>
      </div>
    </div>
  )
}


function NavBar(props) {
  const [cartvisib, setcartvisib] = useState(false);

  const setCartVisib = () => {
    setcartvisib(!cartvisib)
  }
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
  <button onClick={cartvisib ? setCartVisib : null} className="navbar-toggler" data-toggle="collapse" data-target="#navbarCollapse">
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
          <a href="/" className="nav-link">Store</a>
        </li>
        <li className="navbar-item">
          <a href="/history" className="nav-link">History</a>
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
        
        <li  className="navbar-item">
          
          <a onClick={(e) => setCartVisib() && e.preventDefault()}  id="elm" className="nav-link cart-in-header">
          
          { redux?.userData?.cart?.length ?
          <span className="count_in_store">{redux.userData.cart.length}</span> : null
        }
        <Icon type="shopping-cart" className="cart-link" />
          
            </a>
        </li>
      </ul>
}
  </div>
</nav>
</div>
{ cartvisib &&
<HeaderCart setCartVisib={setCartVisib} cartvisib={cartvisib}/>
}

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

//   const [Products, setProducts] = useState([]);
//   const [Skip, setSkip] = useState(0)
//   const [Page, setPage] = useState(1)

//   const [Limit, setLimit] = useState(10)
//   const [PostSize, setPostSize] = useState()
//   const [SearchTerms, setSearchTerms] = useState("")
//   const [MaxPrice, setMaxPrice] = useState(0)
//   const [MinPrice, setMinPrice] = useState(0)
//   const [SearchMaxPrice, setSearchMaxPrice] = useState(0)
//   const [SortBy, setSortBy] = useState('Default')

//   let array_for_check = [];
//   for(let gg = 0 ; gg < TypesOfFilm.length; gg++)
//     array_for_check.push(false)
//   const [WhatWeapon, setWhatWeapon] = useState(array_for_check)
//   const dispatch = useDispatch()
  
//   useEffect(() => {

//     const variables = {
//         skip: Skip,
//         limit: Limit,
//     }
//     getProducts(variables)
// }, [])


// const [lastScrollTop, setLastScrollTop] = useState(0);
//   const [bodyOffset, setBodyOffset] = useState(
//     document.body.getBoundingClientRect()
//   );
//   const [scrollY, setScrollY] = useState(bodyOffset.top);
//   const [scrollX, setScrollX] = useState(bodyOffset.left);
//   const [scrollDirection, setScrollDirection] = useState();

//   const listener = e => {
//     setBodyOffset(document.body.getBoundingClientRect());
//     setScrollY(-bodyOffset.top);
//     setScrollX(bodyOffset.left);
//     setScrollDirection(lastScrollTop > -bodyOffset.top ? "down" : "up");
//     setLastScrollTop(-bodyOffset.top);
//   };

//   useEffect(() => {
//     window.addEventListener("scroll", listener);
//     return () => {
//       window.removeEventListener("scroll", listener);
//     };
//   });
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
         {film.writer._id == redux.userData._id && <Link to={"/film/"+film._id}>Edit</Link>}

          </div>)
        }

      </div>
    {/* <div className="main-page-store">
      <div className="main-page-filters">
        <div className="main-page-search">
          <input value={SearchTerms} placeholder="Search by name" className="main-page-term-search" onChange={(e) => updateSearchTerms(e.target.value)} />
        </div>
        <div className="main-page-price">
        <div className="main-page-range-filter-block">
           <input type="number" placeholder="Min" min={0} value={MinPrice == 0? "" : MinPrice} max={SearchMaxPrice} onChange={(e) => updateMinCost(e)}/><input type="number" placeholder="Max" value={SearchMaxPrice == 0? "" : SearchMaxPrice} onChange={(e) => updateMaxCost(e)} min={MinPrice} max={MaxPrice}/>
        </div> 
        </div>
        <div className="main-page-sort">
        <select onChange={onSortByChange} className="main-page-select-search" value={SortBy}>
          {SortBye.map((item, index) => (
              <option key={item.index + item.value} >{item.value} </option>
          ))}
        </select>
        </div>
        <ul className="main-page-checkout">
        {TypesOfFilm.map((weapon, index) => <li key={weapon.value}>
          <input id={weapon.value+weapon.weapon} type="checkbox" onChange={() => set_checked_t(index) } checked={WhatWeapon[index]}/>
            <label htmlFor={weapon.value+weapon.weapon} className="checkbox">{weapon.value}</label>  
          </li>)}
        </ul>
      </div>
      <div className="main-page-products">
      {Products.length === 0 ? 
        <div className="no-post-yet" style={{ display: 'flex', height: '300px', justifyContent: 'center', alignItems: 'center' }}>
          <h2>No post yet...</h2>
        </div> :<>

        <ul className="main-page-list-of-products">
          {
            Products.map((product, index) => <li key={index} className="main-page-product-element">
              <div id={"carouselProductControls"+index} className="carousel slide carousel-fade" data-ride="carousel">
                         <div className="carousel-inner">
                         {product.images.map((image, index) => (
                                                   <div key={index+image} className={`d-flex flex-wrap align-items-center align-content-center carousel-item ${index === 0 ? "active" : ""}`}>
                                                       <img className="d-block  mx-auto carusel-product-image" 
                                                           src={(image.substring(0, 7) === 'uploads') ? `${config.MAGIC_HOST}/${image}` : `${image}`} alt="productImage" />
                                                   </div>
                                               ))}
                         </div>
                         {product.images.length > 1 ? <>
                         <a className="carousel-control carousel-control-prev" href={"#carouselProductControls"+index} role="button" data-slide="prev">
                         <i className="fas fa-angle-left"></i>
                         </a>
                         <a className="carousel-control carousel-control-next" href={"#carouselProductControls"+index} role="button" data-slide="next">
                         <i className="fas fa-angle-right"></i>
                         </a>
                         </> : null
                       }
                       </div>
                       <div className="main-page-title">
                <a href={`/product/${product._id}`} >{product.title.length < 50 ? product.title :    product.title.substr(0,50)+'...'
}</a>
</div>
                <div className="main-page-cost-of-element">$ {product.price}</div>

              </li>
          )}
          
        </ul>
        <ul className="main-page-list-of-btns">
        { Products.length < PostSize  ?
        <li>
          <button className="main-page-btn-1" onClick={onLoadMore}>Load More</button>
        </li> : null
        }
        { scrollY  >100 && window.scrollY > 10 ?
        <li>
          <button className="main-page-btn-2" onClick={() => window.scrollTo(0, 0)}>Scroll on top</button>
        </li> : null
        }
        </ul>
        </>
        }
      </div>
    </div> */}
    </div>
  )
}
const regex = /[.*+?^${}()|[\]\\]/g
function FileUpload(props) {
  const [InnerFile, setInnerFile] = useState('')
  const [ShowBtn, setShowBtn] = useState(false)
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
    // console.log(arrwithstrs)
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
        // axios.post('http://localhost:3001/adding/',sendObj)
        // .then(res => this.setState({successFile: res.data.toString()}))
        setMainObj(sendObj)
        console.log(sendObj)
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
  const [Products, setProducts] = useState([])
  const [SearchProducts, setSearchProducts] = useState([])

  const rmrfFromProducts = (idid) => {
    axios.get(`${FILM_SERVER}/rmrfProduct?userId=${redux.userData._id}&productId=${idid}`).then(response => {
      setProducts(response.data)
  })
  }

  const getUserProducts = (e) => {
    setSearchProducts(e.target.value)

    axios.get(`${FILM_SERVER}/getUserProducts?userId=${redux.userData._id}&term=${e.target.value}`).then(response => {
      setProducts(response.data)
    })

  } 

  useEffect(() => {
    if(redux?.userData?._id){
    axios.get(`${FILM_SERVER}/getUserProducts?userId=${redux.userData._id}`)
        .then(response => {
              setProducts(response.data)
          })
        }
  }, [redux])

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
              <input placeholder="Find your product" value={SearchProducts} onChange={(e) =>  getUserProducts(e)} />
              {Products.map((item, index) => <div className="delete-row" key={index}>
                <div>{item.title}</div>
<button onClick={() => rmrfFromProducts(item._id)}>
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