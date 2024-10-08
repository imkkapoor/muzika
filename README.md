
## Welcome to Muzika

Dive into a world where your music  journey is as dynamic as you are! Muzika is not just another app—it's your personal music companion that evolves with you 🎶

<img src="./assets/demo/login.png" alt="App Screenshot" height="400">

<br></br>

## Features
💡 **Discover a New Beat** 💡

Muzika harnesses the power of Spotify's cutting-edge recommendation algorithm to bring you a personalized music experience. From your recent songs to your favorite genres and beyond, Muzika crafts a playlist that's uniquely yours.
<br></br>

🔄 **Endless Exploration** 🔄

Swipe, scroll, and explore endlessly with our infinite scrolling feature. Every swipe brings you closer to discovering new tunes that align with your evolving musical taste.

<img src="./assets/demo/home.png" alt="App Screenshot" height="400">
<img src="./assets/demo/playlist.png" alt="App Screenshot" height="400">
<img src="./assets/demo/profile.png" alt="App Screenshot" height="400">

<br></br>

🎤 **Engage & Connect** 🎤

Share your musical thoughts with comments, and dive into discussions with fellow music lovers. With a sleek commenting system and intuitive replies, Muzika transforms your listening experience into a vibrant community. This feature has been a major hit on Reddit, enhancing user engagement and interaction.

<img src="./assets/demo/comments.png" alt="App Screenshot" height="400">

<br></br>

🎸 **Curated Just for You** 🎸

Select up to 5 favorite genres and watch as Muzika refines its recommendations. Your music world expands with each genre you choose, ensuring that you always have fresh tracks to discover.

<img src="./assets/demo/genres.png" alt="App Screenshot" height="400">

<br></br>

🎧 **Seamless Playback** 🎧

Enjoy high-quality audio playback and detailed song information with our custom bottom sheets. Whether you're in the mood for a deep dive into a song or just want to enjoy seamless playback, Muzika has you covered.

## Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/imkkapoor/muzika.git
    cd muzika
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Set up environment variables**:
   
   Create a `.env` file in the root of the project with your Spotify API and Firebase configuration. To get your Spotify credentials, you'll need to set up a [Spotify Developer Account](https://developer.spotify.com/dashboard) and create an application to obtain your credentials:

    ```
    CLIENT_ID=your_spotify_client_id
    CLIENT_SECRET=your_spotify_client_secret
    REDIRECT_URI=your_redirect_uri

    FIREBASE_API_KEY=your_firebase_api_key
    FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
    FIREBASE_PROJECT_ID=your_firebase_project_id
    FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
    FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    FIREBASE_APP_ID=your_firebase_app_id
    FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

    ```

4. **Firebase Setup**:

    - Set up Firebase Firestore with two base collections:
        - **`users`**: To store user profiles and related data.
        - **`songs`**: To store song information and comments. Each song should have a `comments` sub-collection, with comments potentially having a `reply` sub-collection.

5. **Run the app**:
    ```bash
    expo start
    ```

## Work in Progress 🛠️

-   [x] **Caching Data**

    Currently, I am working on implementing a caching system to improve the app's performance.

-   [ ] **Advanced Preferences**

    I am also working on adding some advanced preferences to enhance user customization. These features will allow users to fine-tune their music recommendations and app settings according to their personal preferences, making the app even more tailored to individual needs.

-   [x] **Making/Designing a Logo**

    I am in the process of creating a logo for the app, aiming to encapsulate its essence and make it visually appealing to users.
    

## Contributing

1. **Fork the repository**.
2. **Create a new branch**: `git checkout -b feature/your-feature`.
3. **Make your changes**.
4. **Commit your changes**: `git commit -m 'Add some feature'`.
5. **Push to the branch**: `git push origin feature/your-feature`.
6. **Submit a pull request**.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

-   [Expo](https://expo.dev/)
-   [Spotify API](https://developer.spotify.com/documentation/web-api/)
-   [Firebase](https://firebase.google.com/)
