import React, { useState } from 'react';
import { View, TextInput, FlatList, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GiphySearch = ({ apiKey, onGifSelected }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);

  const searchGifs = async (term) => {
    console.log('Searching GIFs for:', term);
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${term}&limit=25&offset=0&rating=G&lang=en`);
    const json = await response.json();
    setGifs(json.data);
    console.log('GIFs found:', json.data.length);
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    if (text.length > 2) {
      searchGifs(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={24} color="gray" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search GIFs"
          value={searchTerm}
          onChangeText={handleSearchChange}
        />
      </View>
      <FlatList
        data={gifs}
        keyExtractor={(item) => item.id}
        numColumns={3}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onGifSelected(item)}>
            <Image source={{ uri: item.images.preview_gif.url }} style={styles.gif} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => <Text style={styles.noResultsText}>No GIFs found</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  gif: {
    width: 100,
    height: 100,
    margin: 5,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
});

export default GiphySearch;
