import React, { useEffect, useRef, useState } from "react";
import {
    Text,
    ImageBackground,
    View,
    Animated,
    Dimensions,
    Easing
} from "react-native";

import { loadArticle, loadCategories, loadReadArticles, loadFavoriteArticles } from "../functions";

const w = Dimensions.get("screen").width;

const init = async (go, updateProgressBar) => {
    const categories = await loadCategories();
    if (categories.error) {
        setTimeout(() => go("NoInternet"), 2000);
        return;
    }
    const rawArticles = categories.reduce((accumulator, currentValue) => [...accumulator, ...currentValue.articles], []);
    let articles = [];
    for (let i = 0; i < rawArticles.length; i++) {
        const res = await loadArticle(rawArticles[i]);
        if (!res.error) articles.push({
            ...res,
            id: rawArticles[i]
        });
        updateProgressBar((i + 1) / rawArticles.length);
    }
    const readArticles = await loadReadArticles();
    const favoriteArticles = await loadFavoriteArticles();
    go("Main", { categories, articles, readArticles, favoriteArticles });
}

const Loader = ({ value }) => {

    const translateX = useRef(new Animated.Value(-w)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: -w * (1 - value),
            useNativeDriver: true,
            duration: 150,
            easing: Easing.linear
        }).start();
    }, [value]);

    return <View style={{marginBottom: 30}}>
        <Animated.View style={{width: w, height: 6, backgroundColor: "#136384", transform: [{ translateX }]}} />
    </View>;
}

const SplashScreen = ({ navigation }) => {

    const [value, setValue] = useState(0);
    const opacity = useRef(new Animated.Value(0)).current;

    return <View style={{flex: 1, backgroundColor: "#fff"}}>
        <Animated.View style={{flex: 1, opacity}}>
            <ImageBackground
                source={require("../src/splash-image.jpg")}
                style={{flex: 1}}
                onLoad={() => {
                    Animated.timing(opacity, {
                        useNativeDriver: true,
                        toValue: 1,
                        duration: 300
                    }).start();
                    init(navigation.replace, setValue);
                }}
            >
                <View>
                    <Text style={{color: "#000", fontSize: 26, fontFamily: "Raleway-SemiBold", textAlign: "center", marginTop: 90}}>ПСИХОЛОГИЯ ВЛИЯНИЯ</Text>
                    <Text style={{color: "#000", fontSize: 26, fontFamily: "Raleway-SemiBold", textAlign: "center"}}>СИЛА ПОДСОЗНАНИЯ</Text>
                </View>
                <View style={{flex: 1, justifyContent: "flex-end"}}>
                    <Loader value={value} />
                </View>
            </ImageBackground>
        </Animated.View>
    </View>
}

export default SplashScreen;