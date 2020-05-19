<template>
  <div class="home">
    {{userInfo.name}}
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>

// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';
import { mapGetters,mapActions } from 'vuex'
export default {
  name: 'Home',
  components: {
    HelloWorld,
  },
  created(){
    this.setUserInfo({name:9999999});
  },
  computed: {
  
    ...mapGetters([
      'userInfo',
    ])
  },
  methods:{
         ...mapActions([
            'setUserInfo', 
        ]),
  }
 
};
</script>
