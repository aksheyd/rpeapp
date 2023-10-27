import React, { useEffect } from 'react';
import {SafeAreaView, StyleSheet, Keyboard, Button, Text, TextInput} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';



const TextInputExample = () => {
  const [haveWeight, onHaveWeight] = React.useState('');
  const [haveReps, onHaveReps] = React.useState('');
  const [haveRPE, onHaveRPE] = React.useState('');
  const [wantReps, onGetReps] = React.useState('');
  const [wantRPE, onGetRPE] = React.useState('');
  [erm, calcERM] = React.useState(0);
  [weight, calcWeight] = React.useState(0);
  [mems, setMems] = React.useState("");

  _storeData = async () => {
    try {
        await AsyncStorage.setItem('mems', String(erm));
        console.log("mems: " + mems);
    } catch (error) {
        console.log("stor error: " + error)
    }
  }

  _retrieveData = async () => {
    try {
        const value = await AsyncStorage.getItem('mems');
        if (value !== null) {
            // Our data is fetched successfully
            console.log("retr:" + value);
            setMems(value);
            return value;
        }
    } catch (error) {
      console.log("retr error: " + error)
    }
  }

  useEffect(() => {
    calcERM(calc(haveWeight, haveReps, haveRPE));
  }, [haveWeight, haveReps, haveRPE]);

  useEffect(() => {
    calcWeight(calc2(wantReps, wantRPE, erm));
  }, [wantReps, wantRPE]);

  
  useEffect(() => {
    _retrieveData();
    _storeData();
  }, []);

  useEffect(() => {
    _retrieveData();
    _storeData();
  }, [mems, erm]);

  return (
    <SafeAreaView>
      <Text style={{fontSize: 20}}> </Text>
      <Text style={{fontSize: 20}}> </Text>
      <Text style={{fontSize: 30}}>  Have</Text>
      <TextInput
        style={styles.input}
        onChangeText={onHaveWeight}
        value={haveWeight}
        placeholder="Weight"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        onChangeText={onHaveReps}
        value={haveReps}
        placeholder="Reps"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        onChangeText={onHaveRPE}
        value={haveRPE}
        placeholder="RPE"
        keyboardType="numeric"
      />

      <Text style={{fontSize: 20}}>  ER1M: {erm}</Text>
      <Text style={{fontSize: 20}}>  </Text>

      <Text style={{fontSize: 30}}>  Want</Text>
      <TextInput
        style={styles.input}
        onChangeText={onGetReps}
        value={wantReps}
        placeholder="Reps"
        keyboardType="numeric"
      />

      <TextInput
        style={styles.input}
        onChangeText={onGetRPE}
        value={wantRPE}
        placeholder="RPE"
        keyboardType="numeric"
      />

      <Text style={{fontSize: 20}}>  Weight: {weight}</Text>
      <Text style={{fontSize: 20}}>  </Text>

      <Text style={{fontSize: 30}}></Text>
      <Text style={{fontSize: 30}}> Mems: {mems}</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});

function percentage(reps, rpe) {
  // Cap the RPE at 10.
  if (rpe > 10) {
    rpe = 10.0;
  }

  // No prediction if failure occurred, or if RPE is unreasonably low.
  if (reps < 1 || rpe < 4) {
    return 0.0;
  }

  // Handle the obvious case early to avoid bound errors.
  if (reps === 1 && rpe === 10.0) {
    return 100.0;
  }

  // x is defined such that 1@10 = 0, 1@9 = 1, 1@8 = 2, etc.
  // By definition of RPE, then also:
  //  2@10 = 1@9 = 1
  //  3@10 = 2@9 = 1@8 = 2
  // And so on. That pattern gives the equation below.
  var x = (10.0 - rpe) + (reps - 1);

  // The logic breaks down for super-high numbers,
  // and it's too hard to extrapolate an E1RM from super-high-rep sets anyway.
  if (x >= 16) {
    return 0.0;
  }

  var intersection = 2.92;

  // The highest values follow a quadratic.
  // Parameters were resolved via GNUPlot and match extremely closely.
  if (x <= intersection) {
    var a = 0.347619;
    var b = -4.60714;
    var c = 99.9667;
    return a*x*x + b*x + c;
  }

  // Otherwise it's just a line, since Tuchscherer just guessed.
  var m = -2.64249;
  var b = 97.0955;
  return m*x + b;
}

function calc(have_weight, have_reps, have_rpe) {
  // var have_weight = Number(document.getElementById("have-weight").value);
  // var have_reps = Number(document.getElementById("have-reps").value);
  // var have_rpe = Number(document.getElementById("have-rpe").value);
  // var want_reps = Number(document.getElementById("want-reps").value);
  // var want_rpe = Number(document.getElementById("want-rpe").value);
  // var calc_e1rm = document.getElementById("calc-e1rm");
  // var calc_weight = document.getElementById("calc-weight");

  // // Clear the HTML at the start.
  // calc_e1rm.innerHTML = "";
  // calc_weight.innerHTML = "";
  
  have_weight = Number(have_weight);
  have_reps = Number(have_reps);
  have_rpe = Number(have_rpe);
  // Ensure that the E1RM widgets are sane.
  if (isNaN(have_weight) || have_weight <= 0) return;
  if (isNaN(have_reps) || have_reps <= 0) return;
  if (Math.floor(have_reps) !== have_reps) return;
  if (isNaN(have_rpe) || have_rpe <= 0) return;

  // Calculate the E1RM percentage.
  var p = percentage(have_reps, have_rpe);
  if (p <= 0) return;
  var e1rm = have_weight / p * 100;
  if (e1rm <= 0) return;

  Keyboard.dismiss();
  // Write the E1RM.
  // setMems(e1rm.toFixed(1)); FIXME
  return e1rm.toFixed(1);

  // // Ensure that the Weight widgets are sane.
  // if (isNaN(want_reps) || want_reps <= 0) return;
  // if (Math.floor(want_reps) !== want_reps) return;
  // if (isNaN(want_rpe) || want_rpe <= 0) return;

  // // Calculate the Weight percentage.
  // var p2 = percentage(want_reps, want_rpe);
  // if (p2 <= 0) return;
  // var weight = e1rm / 100 * p2;

  // // Write the Weight
  // calc_weight.innerHTML = weight.toFixed(1);
}

function calc2(want_reps, want_rpe, e1rm) {

  want_reps = Number(want_reps);
  want_rpe = Number(want_rpe);

  // Ensure that the Weight widgets are sane.
  if (isNaN(e1rm) || e1rm <= 0) return;
  if (isNaN(want_reps) || want_reps <= 0) return;
  if (Math.floor(want_reps) !== want_reps) return;
  if (isNaN(want_rpe) || want_rpe <= 0) return;

  // Calculate the Weight percentage.
  var p2 = percentage(want_reps, want_rpe);
  if (p2 <= 0) return;
  var weight = e1rm / 100 * p2;
  Keyboard.dismiss();

  return weight.toFixed(1);
}

export default TextInputExample;