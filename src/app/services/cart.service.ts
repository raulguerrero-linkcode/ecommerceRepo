import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CartItem } from '../common/cart-item';
import { Product } from '../common/product';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  

  cartItems: CartItem[] = []

  totalPrice: Subject<number> = new Subject<number>()
  totalQuantity: Subject<number> = new Subject<number>()


  constructor() { }

  addToCart(theCartItem: CartItem){

    // Check if we already have the item in our cart
    let alreadyExistsInCart: boolean = false
    let existingCartItem: CartItem = undefined!


    if (this.cartItems.length>0) {

      /*
      for (let tempCartItem of this.cartItems) {
        if (tempCartItem.id === theCartItem.id){
          existingCartItem = tempCartItem
          break
        }
      }
      */
      existingCartItem = this.cartItems.find( tempCartItem => tempCartItem.id === theCartItem.id)!

    }
    
    // find the item in the cart based on item id
    // check if we found it
    alreadyExistsInCart = (existingCartItem != undefined)

    if (alreadyExistsInCart) {
      existingCartItem.quantity++
    } else{
      this.cartItems.push(theCartItem)
    }

    this.computerCartTotals()

  }

  computerCartTotals(){
    let totalPriceValue: number = 0
    let totalQuantityValue: number = 0

    for (let currentCartItem  of this.cartItems) {
        totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice
        totalQuantityValue += currentCartItem.quantity
    }

    this.totalPrice.next(totalPriceValue)
    this.totalQuantity.next(totalQuantityValue)

    this.logCartData(totalPriceValue, totalQuantityValue)

  }


  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    for (let tempCartItem  of this.cartItems) {
        const subTOtalPrice = tempCartItem.quantity * tempCartItem.unitPrice
    }
  }

  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--

    if (theCartItem.quantity === 0) {
      this.remove(theCartItem)
    } else {
      this.computerCartTotals()
    }
  }

  remove(theCartItem: CartItem){
    const itemIndex = this.cartItems.findIndex( tempCartItem => tempCartItem.id === theCartItem.id)

    if (itemIndex > -1) {{
      this.cartItems.splice(itemIndex, 1  )
      this.computerCartTotals()
    }
      
    }
  }


}
