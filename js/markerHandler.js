var modelList = []

AFRAME.registerComponent("markerhandler",{
    init: function () {    
        this.el.addEventListener("markerFound", () => {
          
          var name = this.el.getAttribute("model_name");
          var barcodeValue = this.el.getAttribute("value");
          modelList.push({ model_name: name, barcode_value: barcodeValue });
          console.log("markerFound")
          
          var model = document.querySelector(`#${name}`);
          model.setAttribute("visible", true);
        });
    
        this.el.addEventListener("markerLost", () => {
          var name = this.el.getAttribute("model_name");
          var index = modelList.findIndex(x => x.model_name === name);
          console.log("markerLost")
          if (index > -1) {
            modelList.splice(index, 1);
          }
        });
      },
      getDistance: function (elA, elB) {
        return elA.object3D.position.distanceTo(elB.object3D.position);
      },
      getModelGeometry: function(models,modelName){
        var barcodes = Object.keys(models)
        for(var barcode of barcodes){
            if(models[barcode].model_name === modelName){
                return{
                    position:models[barcode]["placement_position"],
                    rotation:models[barcode]["placement_rotation"],
                    scale:models[barcode]["placement_scale"],
                    model_url:models[barcode]["model_url"]
                }
            }
        }
      },
      placeTheModel:function(modelName,models){
        
        var isListContainModel = this.isModelPresentInArray(modelList,modelName);
        if(isListContainModel){
          var distance = null;
          var marker1 = document.querySelector(`#marker-base`)
          var marker2 = document.querySelector(`#marker-${modelName}`)
          
          distance = this.getDistance(marker1,marker2);
          if(distance < 3.25){
            var modelEl = document.querySelector(`#${modelName}`)
            modelEl.setAttribute("visible",false)

            var isModelPlaced = document.querySelector(`#model-${modelName}`);
            if(isModelPlaced === null){
              var el = document.createElement("a-entity");
              var modelGeometry = this.getModelGeometry(models,modelName)
              el.setAttribute("id",`model-${modelName}`)
              el.setAttribute("gltf-model",`url(${modelGeometry.model_url})`)
              el.setAttribute("position",modelGeometry.position)
              el.setAttribute("rotation",modelGeometry.rotation)
              el.setAttribute("scale",modelGeometry.scale)
              marker1.appendChild(el)
            }

          }

        }
      },
      isModelPresentInArray:function(arr,val){
        
        console.log(val)
        
        for(var i in arr){
          console.log(i)
          if(arr[i].model_name === val){
            return true

          }
        }
        return false
      },
      tick:async function(){
        var models =  null
        if(modelList.length > 1){
          var isBaseModelPresent =this.isModelPresentInArray(modelList,"base");
          var messageText = document.querySelector("#message-text")

          if(!isBaseModelPresent){
            messageText.setAttribute("visible",true)
          }
          else{
            if(models === null){
              models = await this.getModels()
            }

            messageText.setAttribute("visible",false)
            this.placeTheModel("road",models)
            this.placeTheModel("sun",models)
            this.placeTheModel("car",models)

          }
        }
      },
      getModels:async function () {
        return fetch("js/modellist.json")
          .then(res => res.json())
          .then(data => data);
      },
})