import {
    StyleSheet,
    Text,
    SafeAreaView,
    View,
    ActivityIndicator,
    FlatList,
    Image,
    TouchableOpacity,
} from "react-native";
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import MusicCard from "../components/MusicCard";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ShareBottomSheet from "../bottomSheets/ShareBottomSheet";
import LoadingFullScreen from "../loaders/LoadingFullScreen";
import { getPLaylistSpecificTracks } from "../functions/spotify";
import {
    getNotInterestedSongIds,
    getPlaylistId,
} from "../functions/dbFunctions";
import {
    getAccessToken,
    getSelectedGenreList,
} from "../functions/localStorageFunctions";
import CommentsBottomSheet from "../bottomSheets/CommentsBottomSheet";
import { User } from "../UserContext";

const HomeScreen = () => {
    const navigation = useNavigation();
    const [topSongs, setTopSongs] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const flatListRef = useRef(null);
    const [activeSongId, setActiveSongId] = useState(null);
    const [activeSongShareUrl, setActiveSongShareUrl] = useState(null);
    const [activeSongName, setActiveSongName] = useState(null);
    const numberOfTracksToBeFetched = 20;
    const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
    const [isCommentSectionVisible, setIsCommentSectionVisible] =
        useState(false);
    const [waitingPlaylistAddition, setWaitingPlaylistAddition] =
        useState(false);
    const [alreadyPresentTrackIds, setAlreadyPresentTrackIds] = useState([]);
    const [notInterestedSongIds, setNotInterestedSongIds] = useState([]);
    const { currentUser } = useContext(User);

    const getTopSongs = async () => {
        const accessToken = await getAccessToken();
        try {
            const response = await fetch(
                `https://api.spotify.com/v1/me/top/tracks?limit=5`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Error getiing top songs");
            }

            const data = await response.json();
            setTopSongs(data.items);
        } catch (err) {
            setError(err.message);
        }
    };

    const getAlreadyPresentTrackIds = async () => {
        const playlistId = await getPlaylistId(currentUser);
        const alreadyPresentTracksIds = await getPLaylistSpecificTracks(
            playlistId
        );
        setAlreadyPresentTrackIds(alreadyPresentTracksIds);
    };

    const filterTracks = async (data) => {
        const playableTracks = data.tracks.filter(
            (track) =>
                track.preview_url &&
                !alreadyPresentTrackIds.includes(track.id) &&
                !notInterestedSongIds.includes(track.id)
        );
        return playableTracks;
    };
    const getRandomSeedIds = (tracks, genres) => {
        const seedTracks = tracks.map((track) => ({
            type: "track",
            id: track.id,
        }));
        const seedGenres = genres.map((genre) => ({
            type: "genre",
            id: genre.toLowerCase(),
        }));

        const combinedSeeds = [...seedTracks, ...seedGenres];

        const shuffledSeeds = combinedSeeds.sort(() => 0.5 - Math.random());
        const selectedSeeds = shuffledSeeds.slice(0, 5);

        const selectedTrackIds = selectedSeeds
            .filter((seed) => seed.type === "track")
            .map((seed) => seed.id)
            .join(",");
        const selectedGenreIds = selectedSeeds
            .filter((seed) => seed.type === "genre")
            .map((seed) => seed.id)
            .join(",");

        return { selectedTrackIds, selectedGenreIds };
    };

    const getRecommendations = async (tracks) => {
        const accessToken = await getAccessToken();
        const genres = await getSelectedGenreList();
        const { selectedTrackIds, selectedGenreIds } = getRandomSeedIds(
            tracks,
            genres
        );

        const url = `https://api.spotify.com/v1/recommendations?seed_tracks=${selectedTrackIds}&seed_genres=${selectedGenreIds}&limit=${numberOfTracksToBeFetched}`;

        if (tracks.length > 0 || genres.length > 0) {
            try {
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                if (!response.ok) {
                    throw new Error("Error getting recommendations");
                }

                const data = await response.json();

                const playableTracks = await filterTracks(data);

                setRecommendations((prevRecommendations) => {
                    const uniqueTracks = playableTracks.filter(
                        (track) =>
                            !prevRecommendations.some(
                                (prevTrack) => prevTrack.id === track.id
                            )
                    );

                    if (
                        prevRecommendations.length === 0 &&
                        playableTracks.length > 0
                    ) {
                        setActiveSongId(playableTracks[0].id);
                        setActiveSongShareUrl(
                            playableTracks[0].external_urls.spotify
                        );
                        setActiveSongName(playableTracks[0].name);
                    }
                    return [...prevRecommendations, ...uniqueTracks];
                });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
    };

    // delete after
    const sample = async () => {
        const data = await AsyncStorage.getItem("sampleSongs");

        if (data) {
            const sampleSongs = JSON.parse(data);
            setRecommendations(sampleSongs);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (currentUser) {
                await getAlreadyPresentTrackIds();
                setNotInterestedSongIds(
                    await getNotInterestedSongIds(currentUser)
                );
                await getTopSongs();
            }
        };
        fetchData();
    }, [currentUser]);

    useEffect(() => {
        if (
            topSongs.length > 0 &&
            (alreadyPresentTrackIds.length > 0 ||
                alreadyPresentTrackIds === -1) &&
            (notInterestedSongIds.length > 0 || notInterestedSongIds === -1)
        ) {
            getRecommendations(topSongs);
        }
    }, [topSongs, alreadyPresentTrackIds, notInterestedSongIds]);

    const onViewableItemsChanged = useCallback(({ viewableItems }) => {
        if (viewableItems.length > 0 && viewableItems[0].isViewable) {
            setActiveSongId(viewableItems[0].item.id);
            setActiveSongShareUrl(viewableItems[0].item.external_urls.spotify);
            setActiveSongName(viewableItems[0].item.name);
        }
    }, []);

    const renderItem = useCallback(
        ({ item }) => (
            <MusicCard
                item={item}
                activeSongId={activeSongId}
                setIsBottomSheetVisible={setIsBottomSheetVisible}
                setWaitingPlaylistAddition={setWaitingPlaylistAddition}
                setIsCommentSectionVisible={setIsCommentSectionVisible}
            />
        ),
        [activeSongId, setIsBottomSheetVisible]
    );

    const keyExtractor = useCallback((item) => item.id, []);

    const itemSeparatorComponent = useCallback(() => {
        return <View style={{ height: 25.5 }}></View>;
    });

    const onEndReached = () => {
        getRecommendations(topSongs);
    };

    const listFooterComponent = () => {
        return (
            <ActivityIndicator
                size="small"
                color="white"
                style={{ marginTop: 25.5, marginBottom: 30 }}
            />
        );
    };

    if (error) {
        return (
            <View
                style={{
                    backgroundColor: "black",
                    display: "flex",
                    alignContent: "center",
                    justifyContent: "center",
                    height: "100%",
                }}
            >
                <Text style={{ color: "white" }}>{error}</Text>;
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={styles}>
            <View
                style={{
                    backgroundColor: "black",
                    height: "100%",
                }}
            >
                <SafeAreaView>
                    <View style={styles.navBar}>
                        <Text
                            style={{
                                color: "white",
                                fontFamily: "Inter-SemiBold",
                                fontSize: 20,
                            }}
                        >
                            /múzika
                        </Text>
                        <TouchableOpacity
                            activeOpacity={0.6}
                            onPress={() => {
                                navigation.navigate("Profile");
                            }}
                        >
                            <Image
                                source={{ uri: currentUser?.images[1].url }}
                                style={{
                                    height: 33,
                                    width: 33,
                                    borderRadius: 100,
                                }}
                            ></Image>
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <View style={styles.loading}>
                            <ActivityIndicator size="small" color="white" />
                        </View>
                    ) : (
                        <FlatList
                            data={recommendations}
                            keyExtractor={keyExtractor}
                            ref={flatListRef}
                            onViewableItemsChanged={onViewableItemsChanged}
                            showsVerticalScrollIndicator={false}
                            viewabilityConfig={{
                                itemVisiblePercentThreshold: 70,
                            }}
                            renderItem={renderItem}
                            contentContainerStyle={{ paddingBottom: 150 }}
                            ItemSeparatorComponent={itemSeparatorComponent}
                            onEndReached={onEndReached}
                            snapToInterval={628.5}
                            snapToAlignment="start"
                            decelerationRate="fast"
                            ListFooterComponent={listFooterComponent}
                            onEndReachedThreshold={0.6}
                        />
                    )}
                </SafeAreaView>
                <ShareBottomSheet
                    isBottomSheetVisible={isBottomSheetVisible}
                    onClose={() => setIsBottomSheetVisible(false)}
                    setIsBottomSheetVisible={setIsBottomSheetVisible}
                    url={activeSongShareUrl}
                    name={activeSongName}
                    itemId={activeSongId}
                />
                <CommentsBottomSheet
                    isVisible={isCommentSectionVisible}
                    onClose={() => setIsCommentSectionVisible(false)}
                    songId={activeSongId}
                    songName={activeSongName}
                />

                {waitingPlaylistAddition && <LoadingFullScreen />}
            </View>
        </GestureHandlerRootView>
    );
};

export default HomeScreen;

const styles = StyleSheet.create({
    navBar: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        height: 69,
        width: "88%",
        alignContent: "center",
        alignItems: "center",
        alignSelf: "center",
    },
    loading: {
        backgroundColor: "black",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        height: "90%",
    },
    bottomGradient: {
        flex: 1,
        height: 40,
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
});
