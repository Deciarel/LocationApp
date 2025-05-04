import React, { useState } from 'react';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function App() {
  const [screen, setScreen] = useState('list'); // 'list', 'add', 'map'
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Lomakekentät
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState('');

 const getCoordinates = async (locationName) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ReactNativeApp/1.0 (your@email.com)' // Pakollinen header Nominatimille
      }
    });
    const data = await response.json();
    if (data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    } else {
      alert('Location not found!');
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

const handleAddLocation = async () => {
  if (!name || !description || !rating) return;
  const coords = await getCoordinates(name);
  if (!coords) return;

  const newLocation = {
    id: Date.now().toString(),
    name,
    description,
    rating,
    coordinates: coords,
  };
  setLocations([...locations, newLocation]);
  setName('');
  setDescription('');
  setRating('');
  setScreen('list');
};

  
  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setScreen('map');
  };

  if (screen === 'add') {
    return (
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView>
          <Text style={styles.header}>Add Location</Text>
          <TextInput style={styles.input} placeholder="Name (e.g. Helsinki)" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="Description" value={description} onChangeText={setDescription} />
          <TextInput style={styles.input} placeholder="Rating (1-5)" value={rating} onChangeText={setRating} keyboardType="numeric" />
          <View style={styles.button}>
            <Button title="Add" onPress={handleAddLocation} />
          </View>
          <View style={styles.button}>
            <Button title="Back to List" onPress={() => setScreen('list')} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (screen === 'map' && selectedLocation) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Map View: {selectedLocation.name}</Text>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: selectedLocation.coordinates.latitude,
            longitude: selectedLocation.coordinates.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Marker
            coordinate={selectedLocation.coordinates}
            title={selectedLocation.name}
            description={selectedLocation.description}
          />
        </MapView>
        <View style={styles.button}>
          <Button title="Back to List" onPress={() => setScreen('list')} />
        </View>
      </View>
    );
  }

  // Lista
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Travel Locations</Text>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleSelectLocation(item)} style={styles.item}>
            <Text style={styles.itemTitle}>{item.name} ({item.rating}/5)</Text>
            <Text style={styles.itemDesc}>{item.description}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.button}>
        <Button title="Add New Location" onPress={() => setScreen('add')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 50, paddingHorizontal: 20, backgroundColor: '#f5f5f5' },
  header: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderColor: '#ccc', borderWidth: 1 },
  button: { marginVertical: 5 },
  item: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, borderColor: '#ddd', borderWidth: 1 },
  itemTitle: { fontSize: 18, fontWeight: '600' },
  itemDesc: { fontSize: 14, color: '#555' },
  map: { width: '100%', height: '70%', borderRadius: 10 },
});
