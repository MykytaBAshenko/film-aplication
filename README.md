# MERN_FilmAPP
Run on  
[gunstashop.herokuapp.com](https://filmapplicationwebbylab.herokuapp.com/)  
Simple fullstack app
### What is implemented:
>**1. login and registration**  
>**2. file reading**  
>**3. sorting**  
>**4. searching**  
>**5. account control**  

 
### How start localy:
>**1. git clone**  
>**2. npm install in / && npm install in /client**  
>**3. in folder /server/config create dev.js file**  
>**4. write this in dev.js file and save**  
### 
    module.exports = {
    mongoURI:"mongodb+srv://username:password@YOUR_MONGODBCLUSTER.mongodb.net/film-app?retryWrites=true&w=majority",
    SSECRET:"SECRET"//secret word for secure logining
    }
>**5. write in / node server/index.js && write in ./client/ npm start**  
