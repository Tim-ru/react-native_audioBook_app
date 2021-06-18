import React, { Component } from 'react';
import { Text, View, StyleSheet, ImageBackground, ScrollView, Dimensions } from 'react-native';
import { AudioContext } from '../context/AudioProvider';
import { RecyclerListView, LayoutProvider } from 'recyclerlistview';
import AudioListItem from '../components/AudioListItem';
import Screen from '../components/Screen';
import OptionModal from '../components/OptionModal';
import { Audio } from 'expo-av';
import { play, pause, resume, playNext } from '../misc/audioController';
import { storeAudioForNextOpening } from '../misc/helper';
import background from '../../assets/rectangleBg.png';

export class AudioList extends Component {
  static contextType = AudioContext;

  constructor(props) {
    super(props);
    this.state = {
      optionModalVisible: false,
    };

    this.currentItem = {};
  }

  layoutProvider = new LayoutProvider(
    i => 'audio',
    (type, dim) => {
      switch (type) {
        case 'audio':
          dim.width = Dimensions.get('window').width;
          dim.height = 70;
          break;
        default:
          dim.width = 0;
          dim.height = 0;
      }
    }
  );

  onPlaybackStatusUpdate = async playbackStatus => {
    if (playbackStatus.isLoaded && playbackStatus.isPlaying) {
      this.context.updateState(this.context, {
        playbackPosition: playbackStatus.positionMillis,
        playbackDuration: playbackStatus.durationMillis,
      });
    }

    if (playbackStatus.didJustFinish) {
      const nextAudioIndex = this.context.currentAudioIndex + 1;
      // there is no next audio to play or the current audio is the last
      if (nextAudioIndex >= this.context.totalAudioCount) {
        this.context.playbackObj.unloadAsync();
        this.context.updateState(this.context, {
          soundObj: null,
          currentAudio: this.context.audioFiles[0],
          isPlaying: false,
          currentAudioIndex: 0,
          playbackPosition: null,
          playbackDuration: null,
        });
        return await storeAudioForNextOpening(this.context.audioFiles[0], 0);
      }
      // otherwise we want to select the next audio
      const audio = this.context.audioFiles[nextAudioIndex];
      const status = await playNext(this.context.playbackObj, audio.uri);
      this.context.updateState(this.context, {
        soundObj: status,
        currentAudio: audio,
        isPlaying: true,
        currentAudioIndex: nextAudioIndex,
      });
      await storeAudioForNextOpening(audio, nextAudioIndex);
    }
  };

  handleAudioPress = async audio => {
    const {
      soundObj,
      playbackObj,
      currentAudio,
      updateState,
      audioFiles,
    } = this.context;
    // playing audio for the first time.
    if (soundObj === null) {
      const playbackObj = new Audio.Sound();
      const status = await play(playbackObj, audio.uri);
      const index = audioFiles.indexOf(audio);
      updateState(this.context, {
        currentAudio: audio,
        playbackObj: playbackObj,
        soundObj: status,
        isPlaying: true,
        currentAudioIndex: index,
      });
      playbackObj.setOnPlaybackStatusUpdate(
        this.context.onPlaybackStatusUpdate
      );
      return storeAudioForNextOpening(audio, index);
    }

    // pause audio
    if (
      soundObj.isLoaded &&
      soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      const status = await pause(playbackObj);
      return updateState(this.context, { soundObj: status, isPlaying: false });
    }

    // resume audio
    if (
      soundObj.isLoaded &&
      !soundObj.isPlaying &&
      currentAudio.id === audio.id
    ) {
      const status = await resume(playbackObj);
      return updateState(this.context, { soundObj: status, isPlaying: true });
    }

    // select another audio
    if (soundObj.isLoaded && currentAudio.id !== audio.id) {
      const status = await playNext(playbackObj, audio.uri);
      const index = audioFiles.indexOf(audio);
      updateState(this.context, {
        currentAudio: audio,
        soundObj: status,
        isPlaying: true,
        currentAudioIndex: index,
      });
      return storeAudioForNextOpening(audio, index);
    }
  };

  componentDidMount() {
    this.context.loadPreviousAudio();
  }

  rowRenderer = (type, item, index, extendedState) => {
    return (
      <AudioListItem
        title={item.filename}
        isPlaying={extendedState.isPlaying}
        activeListItem={this.context.currentAudioIndex === index}
        duration={item.duration}
        onAudioPress={() => this.handleAudioPress(item)}
        onOptionPress={() => {
          this.currentItem = item;
          this.setState({ ...this.state, optionModalVisible: true });
        }}
      />

    );
  };

  render() {
    return (
      <AudioContext.Consumer style={{ flex: 1 }}>
        {({ dataProvider, isPlaying }) => {
          if (!dataProvider._data.length) return null;
          return (
            <Screen>

              <ScrollView>
                <View style={styles.main}>
                  <View style={styles.container}>

                    <View style={styles.header}>
                      <Text style={styles.textLogo}>AudioBook</Text>
                    </View>

                    <View style={styles.title}>
                      <Text style={styles.titleText}>Last book</Text>
                      <ImageBackground style={styles.bookBackground} source={background}>

                      </ImageBackground>
                    </View>

                    <View style={styles.title} >
                      <Text style={styles.titleText}>Books</Text>
                      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                        <View style={styles.bookList}>
                          <RecyclerListView
                            dataProvider={dataProvider}
                            layoutProvider={this.layoutProvider}
                            rowRenderer={this.rowRenderer}
                            extendedState={{ isPlaying }}
                          />
                          <OptionModal
                            onPlayPress={() => console.log('Playig audio')}
                            onPlayListPress={() => {
                              this.context.updateState(this.context, {
                                addToPlayList: this.currentItem,
                              });
                              this.props.navigation.navigate('PlayList');
                            }}
                            currentItem={this.currentItem}
                            onClose={() =>
                              this.setState({ ...this.state, optionModalVisible: false })
                            }
                            visible={this.state.optionModalVisible}
                          />
                        </View>
                      </ScrollView>
                    </View>

                    <View style={styles.title}>
                      <Text style={styles.titleText}>Notes</Text>

                      <View style={styles.note}>
                        <Text style={styles.noteText}>Note 1:</Text>
                      </View>
                      <View style={styles.note}>
                        <Text style={styles.noteText}>Note 2:</Text>
                      </View>
                      <View style={styles.note}>
                        <Text style={styles.noteText}>Note 3:</Text>
                      </View>
                    </View>


                  </View>
                </View>
              </ScrollView>

            </Screen>
          );

        }}

      </AudioContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  main: {
    fontFamily: 'Poppins',
    width: '100%',
    flex: 1,
    alignItems: 'center',
    paddingRight: 30,
    paddingLeft: 30
  },
  container: {
    alignItems: 'center',
    width: '100%',
  },
  header: {
    height: 70,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 10,
    textAlign: 'left',

  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  textLogo: {
    textAlign: 'left',
    fontSize: 24,
    fontWeight: '600',
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

  },
  tipRect: {
    height: 230,
    width: '100%',
    backgroundColor: 'orange',
  },

  bookBackground: {
    /* Rectangle 8 */

    width: '100%',
    height: 200,
    borderRadius: 40,
    display: 'flex',
    justifyContent: 'center'
  },
  background: {
    left: 0,
    right: 0,
    top: 0,
    width: 100,
    height: 230,
  },

  bookScroll: {
    width: '100%',
    height: 126,
    backgroundColor: '#0C0026',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  bookList: {
    flex: 1,
    minHeight: 1, 
    minWidth: 1,
    backgroundColor: '#0C0026',
    borderRadius: 40,
    minHeight: 126,
    paddingVertical: 10,
    paddingVertical: 20
  },

  note: {
    backgroundColor: '#C4C4C4',
    width: '100%',
    height: 60,
    borderRadius: 40,
    marginBottom: 12,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  noteText: {
    textAlign: 'left'

  }
});

export default AudioList;
