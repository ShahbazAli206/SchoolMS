import React, {useState} from 'react';
import {View, Text, TextInput, TouchableOpacity, StyleSheet} from 'react-native';
import {useTheme} from '../../themes/ThemeContext';

const AppInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  rightElement,
  editable = true,
  containerStyle,
  inputStyle,
  onBlur,
  maxLength,
}) => {
  const {colors, spacing, borderRadius, textStyles} = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.error
    : focused
    ? colors.primary
    : colors.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text style={[textStyles.label, {color: colors.textSecondary, marginBottom: 5}]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputWrap,
          {
            borderColor,
            borderRadius: borderRadius.md,
            backgroundColor: editable ? colors.inputBg : colors.grey200,
            borderWidth: focused ? 1.5 : 1,
          },
        ]}>
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}

        <TextInput
          style={[
            styles.input,
            textStyles.body1,
            {
              color: colors.textPrimary,
              paddingLeft: leftIcon ? 0 : spacing.md,
              paddingRight: secureTextEntry || rightElement ? 0 : spacing.md,
              paddingVertical: spacing.sm + 2,
              flex: 1,
              textAlignVertical: multiline ? 'top' : 'center',
              minHeight: multiline ? numberOfLines * 44 : undefined,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          editable={editable}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => {setFocused(false); onBlur?.();}}
        />

        {secureTextEntry ? (
          <TouchableOpacity
            style={styles.rightBtn}
            onPress={() => setShowPassword(p => !p)}>
            <Text style={{fontSize: 16}}>{showPassword ? '🙈' : '👁'}</Text>
          </TouchableOpacity>
        ) : rightElement ? (
          <View style={styles.rightBtn}>{rightElement}</View>
        ) : null}
      </View>

      {error ? (
        <Text style={[textStyles.caption, {color: colors.error, marginTop: 3}]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginBottom: 14},
  inputWrap: {flexDirection: 'row', alignItems: 'center', overflow: 'hidden'},
  leftIcon: {paddingHorizontal: 12},
  rightBtn: {paddingHorizontal: 12},
  input: {fontSize: 14},
});

export default AppInput;
