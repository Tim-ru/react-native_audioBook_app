import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput
} from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import PlayListInputModal from '../components/PlayListInputModal';
import { AudioContext } from '../context/AudioProvider';
import color from '../misc/color';

const Notes = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const context = useContext(AudioContext);
  const { playList, addToPlayList, updateState } = context;

  const createPlayList = async playListName => {
    const result = await AsyncStorage.getItem('playlist');
    if (result !== null) {
      const audios = [];
      if (addToPlayList) {
        audios.push(addToPlayList);
      }
      const newList = {
        id: Date.now(),
        title: playListName,
        audios: audios,
      };

      const updatedList = [...playList, newList];
      updateState(context, { addToPlayList: null, playList: updatedList });
      await AsyncStorage.setItem('playlist', JSON.stringify(updatedList));
    }
    setModalVisible(false);
  };

  const renderPlayList = async () => {
    const result = await AsyncStorage.getItem('playlist');
    if (result === null) {
      const defaultPlayList = {
        id: Date.now(),
        title: 'My Favorite',
        audios: [],
      };

      const newPlayList = [...playList, defaultPlayList];
      updateState(context, { playList: [...newPlayList] });
      return await AsyncStorage.setItem(
        'playlist',
        JSON.stringify([...newPlayList])
      );
    }

    updateState(context, { playList: JSON.parse(result) });
  };

  useEffect(() => {
    if (!playList.length) {
      renderPlayList();
    }
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.title}>
        <Text style={styles.titleText}>Create Note</Text>
        <View style={styles.createNote}>
          <View>
            <TextInput style={styles.noteInput}></TextInput>
          </View>
          <View>
            <TouchableOpacity>
              <AntDesign style={styles.createNoteButton} 
                         name="plus"  
                         color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <View style={styles.title}>
        <Text style={styles.titleText}>Your Notes</Text>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  playListBanner: {
    padding: 5,
    backgroundColor: 'rgba(204,204,204,0.3)',
    borderRadius: 5,
    marginBottom: 15,
  },
  audioCount: {
    marginTop: 3,
    opacity: 0.5,
    fontSize: 14,
  },
  playListBtn: {
    color: color.ACTIVE_BG,
    letterSpacing: 1,
    fontWeight: 'bold',
    fontSize: 14,
    padding: 5,
  },
  noteInput: {
    borderWidth: 1,
    width: 200,
    backgroundColor: '#eee'
  },
  createNote: {
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center'
  },
  createNoteButton: {
    fontSize: 30,
    backgroundColor: '#641E8E',
    color: '#fff',
    borderRadius: 50,
    padding: 3
  },
  title: {
    fontFamily: 'Poppins',
    width: '100%',
    textAlign: 'left',
    marginTop: 44,
    marginBottom: 18,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 20,
  }
});

export default Notes;
