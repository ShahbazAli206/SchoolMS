import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error) {
    return {hasError: true, error};
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.msg}>{this.state.error?.message || 'Unexpected error'}</Text>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => this.setState({hasError: false, error: null})}>
            <Text style={styles.btnText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#fff'},
  title:     {fontSize: 20, fontWeight: '700', color: '#e74c3c', marginBottom: 12},
  msg:       {fontSize: 14, color: '#555', textAlign: 'center', marginBottom: 32},
  btn:       {backgroundColor: '#3498db', paddingHorizontal: 32, paddingVertical: 12, borderRadius: 8},
  btnText:   {color: '#fff', fontWeight: '600', fontSize: 16},
});

export default ErrorBoundary;
