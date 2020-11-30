# MERN_FilmAPP
Run on  
[filmapplicationwebbylab.herokuapp.com](https://filmapplicationwebbylab.herokuapp.com/)  
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
    mongoURI:"mongodb+srv://username:password@YOUR_MONGODBCLUSTER.mongodb.net/YOUR_MONGOD_COLLECTION?retryWrites=true&w=majority",
    SECRET:"SECRET"//secret word for secure logining
    }
>**5. write in / node server/index.js && write in ./client/ npm start**  




### Text example which should be in file for file upload
 
    Title: Blazing Saddles
    Release Year: 1974
    Format: VHS
    Stars: Mel Brooks, Clevon Little, Harvey Korman, Gene Wilder, Slim Pickens, Madeline Kahn
    Title: Casablanca
    Release Year: 1942
    Format: DVD
    Stars: Humphrey Bogart, Ingrid Bergman, Claude Rains, Peter Lorre
