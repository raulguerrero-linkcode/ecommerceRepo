import { Component, OnInit } from '@angular/core'
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms'
import { Router } from '@angular/router'
import { Country } from 'src/app/common/country'
import { Order } from 'src/app/common/order'
import { OrderItem } from 'src/app/common/order-item'
import { Purchase } from 'src/app/common/purchase'
import { State } from 'src/app/common/state'
import { CartService } from 'src/app/services/cart.service'
import { CheckoutService } from 'src/app/services/checkout.service'
import { ShopFormServiceService } from 'src/app/services/shop-form-service.service'
import { ShopValidators } from 'src/app/validators/shop-validators'

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup 
  
  totalPrice: number =0
  totalQuantity: number = 0

  creditCardYears: number[] = []
  creditCardMonth: number[] =[]

  countries: Country[] = []
  shippingAddressStates: State[] = []
  billingAddressStates: State[] = []
  

  constructor(private formBuilder: FormBuilder, 
    private shopFormServiceService: ShopFormServiceService, 
    private cartService: CartService,
    private checkOutService: CheckoutService,
    private router: Router
               ) { }

  ngOnInit(): void {

    this.reviewCartDetails()

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', 
                              [Validators.required, 
                               Validators.minLength(2), 
                               ShopValidators.notOnlyWhitespace!]),

        lastName:  new FormControl('', 
                              [Validators.required, 
                               Validators.minLength(2), 
                               ShopValidators.notOnlyWhitespace!]),
                               
        email: new FormControl('',
                              [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), 
                                     ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), 
                                   ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), 
                                      ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), 
                                     ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), 
                                   ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), 
                                      ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard:  new FormControl('', [Validators.required, Validators.minLength(2), 
                                          ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    })


    // Populate the credit card months
    const startMonth: number = 1
    
    this.shopFormServiceService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonth = data
      }
    )

    // Popoulate the credit card years
    this.shopFormServiceService.getCreditCardYears().subscribe(
      data => {
        this.creditCardYears = data
      }
    )

    // Populate Countries
    this.shopFormServiceService.getCountries().subscribe(
      data => {
        this.countries = data
      }
    )


    // POPULATE THE STATES
    

  }
  reviewCartDetails() {
    
    // Subscribe to cartService.TotalQuantity
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    )

    // Subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    )


  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName')! }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName')! }
  get email() { return this.checkoutFormGroup.get('customer.email')! }

  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street')! }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city')! }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state')! }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode')! }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country')! }

  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street')! }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city')! }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state')! }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode')! }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country')! }

  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType')! }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard')! }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber')! }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode')! }

  onSubmit(){
    console.log("Handling the subm,it button")
    console.log(this.checkoutFormGroup.get('customer')!.value)
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched()
      return
    }
    
    // Set the order
    let order = new Order
    order.totalPrice = this.totalPrice
    order.totalQuantity = this.totalQuantity

    //get cartDetails
    const cartItems = this.cartService.cartItems
    
    // creatte orderItems
    let orderItems: OrderItem[] = cartItems.map(tempCartItem => new OrderItem(tempCartItem))

    // set up the purchase
    let purchase = new Purchase()

    purchase.customer = this.checkoutFormGroup.controls['customer'].value

    // populate billing and shipping address
    purchase.shippingAddress = this.checkoutFormGroup.controls['shippingAddress'].value
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state))
    const shipingCountry: State = JSON.parse(JSON.stringify(purchase.shippingAddress.country))
    purchase.shippingAddress.state = shippingState.name
    purchase.shippingAddress.country = shipingCountry.name

    // populate purchase billing address
    purchase.billingAddress = this.checkoutFormGroup.controls['billingAddress'].value
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state))
    const billingCountry: State = JSON.parse(JSON.stringify(purchase.billingAddress.country))
    purchase.billingAddress.state = billingState.name
    purchase.billingAddress.country = billingCountry.name

    // populate purchase
    purchase.order = order
    purchase.orderItems = orderItems


    console.log("Saving the order and get the UUID order " + JSON.parse(JSON.stringify(purchase)))
    // call REST API
    this.checkOutService.placeOrder(purchase).subscribe(
      {
        next: response => {alert(`Su orden ha sido recibida con éxito.\nNúmero de orden: ${response.orderTrackingNumer}`)
            // reset the cart
            this.resetCart()

      },
        error:  err => {
          alert(`Su solicitud no fué completada. \n ${err.message}`)
        }
      }
    )

  }

  resetCart(){
    this.cartService.cartItems=[]
    this.cartService.totalPrice.next(0)
    this.cartService.totalQuantity.next(0)

    this.checkoutFormGroup.reset

    this.router.navigateByUrl("/products")

  }


  copyShipingAddressToBillingAddress(event: Event){
    
    if (event.target?.dispatchEvent) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value)

      // bug fix for states
      this.billingAddressStates = this.shippingAddressStates
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset()
  
      // bug fix for states
      this.billingAddressStates = []
    }
  }

  handleMonthsAndYears(){

    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard')

    const currentYear: number = new Date().getFullYear()

    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear)

    let startMonth: number=0

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() +1
    } else{
      startMonth = 1
    }

    this.shopFormServiceService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonth = data
      }
    )

  }

  getStates(formGroupName: string){
    const formGroup = this.checkoutFormGroup.get(formGroupName)
    const countryCode = formGroup?.value.country.code
    // console.log("Enviando " + countryCode)
    // const countryName = formGroup?.value.state.name

    this.shopFormServiceService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          
          this.shippingAddressStates = data
        } else{
          this.billingAddressStates = data
        }

        //select the first item by default
        formGroup?.get('state')?.setValue(data[0])
      }
    )
  }
}
