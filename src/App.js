import './App.css';
import firebaseConfig from './firebaseConfig';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, FacebookAuthProvider, onAuthStateChanged, updateProfile } from "firebase/auth";
import { getDatabase, ref, set, child, get } from "firebase/database";
import { useEffect, useState } from 'react';


function App() {
  const [user, setUser] = useState({
    name: '',
    email: '',
    photo: '',
    dateOfBirth: '',
    gender: '',
    singUp: false,
  });
  const [inputUser, setInputUser] = useState({
    name: '',
    gender: '',
    dateOfBirth: '',
    email: '',
    password: '',
    confirmPassword: '',
    photo: '',
    conPassCondition: true,
  });

  const GoogleIcone = <img src="https://img.icons8.com/color/48/000000/google-logo.png" />
  const facebookIcone = <img src="https://img.icons8.com/color/48/000000/facebook-new.png" />
  const logOutIcone = <img src="https://img.icons8.com/external-yogi-aprelliyanto-detailed-outline-yogi-aprelliyanto/64/000000/external-log-out-arrow-yogi-aprelliyanto-detailed-outline-yogi-aprelliyanto.png" />
  const app = initializeApp(firebaseConfig);
  const GoogleProvider = new GoogleAuthProvider();
  const fbProvider = new FacebookAuthProvider();
  const auth = getAuth(app);
  const db = getDatabase(app);
  const userInfo = auth.currentUser;

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      const newUser = {
        name: '',
        email: '',
        photo: '',
        dateOfBirth: ''
      }
      if (user) {
        newUser.name = user.displayName
        newUser.email = user.email
        newUser.photo = user.photoURL
        setUser(newUser)

        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${user.uid}`))
          .then((snapshot) => {
            if (snapshot.exists()) {
              const existUser = snapshot.val()
              newUser.name = existUser.username
              newUser.gender = existUser.gender
              newUser.dateOfBirth = existUser.dateOfBirth
              newUser.email = existUser.email
              setUser(newUser)
            } else {
              console.log("No data available");
            }
          }).catch((error) => {
            console.error(error);
          });
      }
      setUser(newUser)

    });
  }, [])

  function writeUserData(userId, name, gender, dateOfBirth, email) {
    const db = getDatabase();
    set(ref(db, 'users/' + userId), {
      username: name,
      gender: gender,
      dateOfBirth: dateOfBirth,
      email: email,
    });
  }

  const handleSignInWithGoogle = () => {
    signInWithPopup(auth, GoogleProvider)
      .then(result => {
        const newUser = {
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL
        };
        console.log('skjfkls')
        setUser(newUser)
      })
      .catch(error => console.log(error))
  }
  const handleSignInWithFacebook = () => {
    signInWithPopup(auth, fbProvider)
      .then((result) => {
        const user = result.user;
        const newUser = {
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL
        };
        console.log(result.suer)
        setUser(newUser)
        const credential = FacebookAuthProvider.credentialFromResult(result);
        const accessToken = credential.accessToken;
        console.log(credential)

        console.log(accessToken)
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        // const credential = FacebookAuthProvider.credentialFromError(error);
        console.log(errorCode)
        console.log(errorMessage)
        console.log(email)
      });
  }

  const handleGoogleSingOut = () => {
    const newUser = {
      name: '',
      email: '',
      photo: ''
    }
    signOut(auth)
      .then()
      .catch()
    console.log('jksdjfk')
    setUser(newUser)
  }
  const ConfirmInputHnadeler = (e) => {
    const conPassword = e.target.value
    const newUser = { ...inputUser }
    newUser.confirmPassword = conPassword
    setInputUser(newUser)
  }
  const inputHnadeler = (e) => {
    let typeName = ''
    typeName = e.target.name
    let input = '';
    const emailRex = /\S+@\S+\.\S+/
    if (typeName === 'email' && emailRex.test(e.target.value)) {
      input = e.target.value
    }
    if (typeName === 'password' && e.target.value.length > 5) {
      input = e.target.value
    }
    if (typeName === 'name' && typeName.length > 1) {
      input = e.target.value
    }
    if (typeName === 'gender' && e.target.value !== "Custom") {
      input = e.target.value
    }
    if (typeName === 'dateOfBirth') {
      input = e.target.value
    }

    inputUser[typeName] = input
    const newUser = { ...inputUser }

    setInputUser(newUser)
  }
  const fromHandle = (e) => {
    const newUser = { ...user }

    const newUserForCondition = { ...inputUser }

    if (inputUser.password !== inputUser.confirmPassword) {
      newUserForCondition.conPassCondition = false
      setInputUser(newUserForCondition)
    }

    if (inputUser.email && inputUser.password === inputUser.confirmPassword && inputUser.name && inputUser.gender && inputUser.dateOfBirth) {
      createUserWithEmailAndPassword(auth, inputUser.email, inputUser.password)
        .then((userCredential) => {
          const user = userCredential.user;
          newUser.name = inputUser.name
          newUser.email = inputUser.email
          console.log(user)
          setUser(newUser)
          writeUserData(user.uid, inputUser.name, inputUser.gender, inputUser.dateOfBirth, inputUser.email)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode)
          console.log(errorMessage)
        });
    }

    e.preventDefault()
  }

  const logInHandeler = (e) => {
    const newUser = { ...user }


    if (inputUser.email && inputUser.password) {
      signInWithEmailAndPassword(auth, inputUser.email, inputUser.password)
        .then((userCredential) => {
          const user = userCredential.user;
          console.log(user)
          newUser.name = user.displayName
          newUser.email = user.email
          newUser.photo = user.photoURL
          setUser(newUser)
        })
        .catch((error) => {
          const errorCode = error.code;
          const errorMessage = error.message;
          console.log(errorCode)
          console.log(errorMessage)

        });
    }
    e.preventDefault()
  }
  const navicateSingUp = () => {
    const newUser = { ...user }
    newUser.singUp = true;
    console.log('kdslfjlk')
    setUser(newUser)
  }
  const navicateSingIn = () => {
    const newUser = { ...user }
    newUser.singUp = false;
    console.log('kdslfjlk')
    setUser(newUser)
  }
  console.log(user)
  return (
    <div className="App">
      <div>
        {
          user.singUp && !user.email && <form onSubmit={fromHandle} className="form-controler row">
            <label for="staticEmail" className='col-6 my-1'>Name:</label>
            <input type="text" name="name" onBlur={inputHnadeler} placeholder='Full Name' className="col-6 my-1" />

            <label for="staticEmail" className='col-6 my-1'>Gender:</label>
            <select name="gender" onBlur={inputHnadeler} className='col-6 my-1'>
              <option>Female</option>
              <option>Male</option>
              <option>Custom</option>
            </select>

            <label for="staticEmail" className='col-6 my-1'>Date of birth:</label>
            <input type="date" name="dateOfBirth" onBlur={inputHnadeler} className='col-6 my-1' ></input>

            <label for="staticEmail" className='col-6 my-1'>Email:</label>
            <input type="email" name='email' onBlur={inputHnadeler} placeholder='Email' className="col-6 my-1" />

            <label for="staticEmail" className='col-6 my-1'>Password:</label>
            <input type="password" name='password' onBlur={inputHnadeler} placeholder='Password' className="col-6 my-1" />

            <label for="staticEmail" className='col-6 my-1'>Confirm password:</label>
            <input type="password" onBlur={ConfirmInputHnadeler} placeholder='Confirm password' className="col-6 my-1" />

            <input type="submit" value="Submit" className='submit m-auto my-4 ' />

            {
              inputUser.confirmPassword && !inputUser.conPassCondition && <p>Note: please provide right confirm password.</p>
            }

            <p>Do have an account? <strong onClick={navicateSingIn}>Sign In</strong></p>
          </form>
        }
      </div>
      {
        !user.email && !user.singUp && <form onSubmit={logInHandeler} className="form-controler row">

          <label for="staticEmail" className='col-6'>Email:</label>
          <input type="email" name="email" onBlur={inputHnadeler} placeholder='Email' className="col-6" />

          <label for="staticEmail" className="col-6">Password:</label>
          <input type="password" name="password" onBlur={inputHnadeler} placeholder='Password' className="col-6" />


          <input type="submit" value="Log In" className='submit m-auto my-4 ' />
          <p>Don't have an account? <strong onClick={navicateSingUp}>Sign up</strong></p>
        </form>
      }
      <div>
        {
          user.photo && <img src={user.photo} alt="logo" />
        }
        {
          user.name && <p>Name: {user.name}</p>
        }
        {
          user.gender && <p>gender: {user.gender}</p>
        }
        {
          user.dateOfBirth && <p>Date of Birth: {user.dateOfBirth}</p>
        }
        {
          user.email && <p>Email: {user.email}</p>
        }
        <p>{user.name}</p>

      </div>
      {
        !user.email && !user.singUp && <button onClick={handleSignInWithGoogle} className="g-button">{GoogleIcone} Sign up with Google</button>
      }
      {
        !user.email && !user.singUp && <button onClick={handleSignInWithFacebook} className="g-button">{facebookIcone} Sign up with Facebook</button>
      }
      {
        user.email && <button onClick={handleGoogleSingOut} className='log-out'> {logOutIcone} Log Out</button>
      }


    </div>
  )
}

export default App;
