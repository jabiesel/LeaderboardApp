import React, {useState} from 'react';
import {Provider, useDispatch, useSelector} from 'react-redux';
import store from './src/redux/store';
import leaderboardData from './src/data/leaderboard.json';
import {setUsername, setLeaderboard} from './src/redux/store';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
} from 'react-native';

// Interface for the leaderboard user object
interface LeaderboardUser {
  bananas: number;
  lastDayPlayed: string;
  longestStreak: number;
  name: string;
  stars: number;
  subscribed: boolean;
  uid: string;
}

const App = () => {
  // States for user input, search results, and leaderboard sorting
  const [username, setUsernameState] = useState('');
  const [userFound, setUserFound] = useState<LeaderboardUser | null>(null);
  const [fuzzyResults, setFuzzyResults] = useState<LeaderboardUser[]>([]);
  const [isAscending, setIsAscending] = useState(false);
  const dispatch = useDispatch();

  // Function to handle user search
  const handleSearch = () => {
    if (username.trim() === '') {
      Alert.alert('Error', 'Please enter a username before searching.');
      return;
    }

    console.log(`Searching for user: ${username}`);

    // Sort the leaderboard data by bananas in descending order
    const sortedLeaderboard = Object.values(leaderboardData).sort(
      (a, b) => b.bananas - a.bananas,
    );

    // Attempt to find the exact user in the sorted leaderboard
    const foundUser = sortedLeaderboard.find(
      user => user.name.toLowerCase() === username.toLowerCase(),
    );

    if (!foundUser) {
      // Fuzzy search for partial matches if the exact user is not found
      const results = sortedLeaderboard.filter(user =>
        user.name.toLowerCase().includes(username.toLowerCase()),
      );

      setFuzzyResults(results);
      setUserFound(null); // Clear exact user state
    } else {
      // Get the rank of the found user
      const userRank =
        sortedLeaderboard.findIndex(
          user => user.name.toLowerCase() === username.toLowerCase(),
        ) + 1;

      // Get the top 10 users from the leaderboard
      const top10Leaderboard = sortedLeaderboard.slice(0, 10);

      // Ensure the found user is added to the top 10 if not already present
      if (!top10Leaderboard.find(user => user.name === foundUser.name)) {
        top10Leaderboard[9] = foundUser;
      }

      // Dispatch updated leaderboard and highlight the searched user
      dispatch(setLeaderboard(top10Leaderboard));
      dispatch(setUsername(username));
      setUserFound({...foundUser, bananas: userRank});
      setFuzzyResults([]); // Clear fuzzy search results
    }
  };

  // Function to sort the leaderboard by name or bananas
  const sortLeaderboard = (type: string) => {
    let sortedList = Object.values(leaderboardData);

    if (type === 'name') {
      // Sort by name alphabetically
      sortedList.sort((a, b) => a.name.localeCompare(b.name));
    } else if (type === 'bananas') {
      // Sort by bananas in descending order
      sortedList.sort((a, b) => b.bananas - a.bananas);
    }

    dispatch(setLeaderboard(sortedList));
  };

  // Toggle between ascending and descending sort order for bananas
  const toggleSortOrder = () => {
    let sortedList = Object.values(leaderboardData);

    if (isAscending) {
      // Sort by bananas in descending order
      sortedList.sort((a, b) => b.bananas - a.bananas);
    } else {
      // Sort by bananas in ascending order, and alphabetically for ties
      sortedList.sort((a, b) => {
        if (a.bananas === b.bananas) {
          return a.name.localeCompare(b.name);
        }
        return a.bananas - b.bananas;
      });
    }

    setIsAscending(!isAscending);
    dispatch(setLeaderboard(sortedList));
  };

  // Select the leaderboard state from Redux store
  const leaderboard = useSelector((state: any) => state.leaderboard);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Leaderboard Search</Text>

      {/* Input field and search button */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#888"
          value={username}
          onChangeText={setUsernameState}
        />
        <TouchableOpacity style={styles.button} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Display the exact user or show no user found message */}
      {userFound ? (
        <Text style={styles.result}>
          User: {userFound.name} - Bananas: {userFound.bananas}
        </Text>
      ) : (
        fuzzyResults.length === 0 && (
          <Text style={styles.result}>User not found</Text>
        )
      )}

      {/* Display fuzzy search results if applicable */}
      {fuzzyResults.length > 0 && (
        <View style={styles.fuzzyResults}>
          <Text style={styles.resultTitle}>Fuzzy Search Results:</Text>
          {fuzzyResults.map((user, index) => (
            <Text key={user.uid} style={styles.resultText}>
              {index + 1}. {user.name} - Bananas: {user.bananas}
            </Text>
          ))}
        </View>
      )}

      {/* Sorting buttons */}
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => sortLeaderboard('name')}>
        <Text style={styles.sortButtonText}>Sort by Name</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
        <Text style={styles.sortButtonText}>
          {isAscending ? 'Sort by Highest' : 'Sort by Lowest'}
        </Text>
      </TouchableOpacity>

      {/* Leaderboard display */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.leaderboard}>
          {/* Table headers */}
          <View style={styles.leaderboardHeader}>
            <Text style={styles.leaderboardHeaderText}>Rank</Text>
            <Text style={styles.leaderboardHeaderText}>Name</Text>
            <Text style={styles.leaderboardHeaderText}>Bananas</Text>
          </View>
          {/* Leaderboard entries */}
          {leaderboard.map((user: LeaderboardUser, index: number) => (
            <View
              key={user.uid}
              style={[
                styles.leaderboardItem,
                user.name === username ? styles.highlighted : {},
              ]}>
              <Text style={styles.leaderboardText}>{index + 1}.</Text>
              <Text style={styles.leaderboardText}>{user.name}</Text>
              <Text style={styles.leaderboardText}>{user.bananas}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const AppWrapper = () => (
  <Provider store={store}>
    <App />
  </Provider>
);

// Styles for the application UI
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  result: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  sortButton: {
    backgroundColor: '#ff9800',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
  sortButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  scrollView: {
    marginTop: 20,
    width: '100%',
  },
  leaderboard: {
    marginTop: 10,
    width: '100%',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  leaderboardHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  leaderboardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  leaderboardText: {
    fontSize: 16,
  },
  highlighted: {
    backgroundColor: '#ffeb3b',
  },
  fuzzyResults: {
    marginTop: 20,
    width: '90%',
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
  },
});

export default AppWrapper;
