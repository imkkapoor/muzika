import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ChoosePlaylistScreen = () => {
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);

  useEffect(() => {
    fetchPlaylists();
  }, []);

  const fetchPlaylists = async () => {
    const accessToken = await AsyncStorage.getItem("token");

    try {
      const response = await fetch('https://api.spotify.com/v1/me/playlists', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setPlaylists(data.items);
    } catch (error) {
      console.error(error);
    }
  };

  const selectPlaylist = async (id) => {
    setSelectedPlaylistId(id);
    // await AsyncStorage.setItem('selectedPlaylistId', id);
    console.log('Saved Playlist ID:', id);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={playlists}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => selectPlaylist(item.id)}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
              {item.images && item.images.length > 0 && (
                <Image 
                  source={{ uri: item.images[0].url }} 
                  style={{ width: 50, height: 50, marginRight: 10 }} 
                />
              )}
              <Text>{item.name}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      {selectedPlaylistId && <Text>Selected Playlist ID: {selectedPlaylistId}</Text>}
    </SafeAreaView>
  );
};

export default ChoosePlaylistScreen;
