using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Task_3.Models;
namespace Task_3.Tests
{
    [TestClass]
    public class UnitTest1
    {
        private IDiscountHelper getTestObject()
        {
            return new MinimumDiscountHelper();
        }

        [TestMethod]
        public void Discount_Above_100()
        {
            //Аrrange (организация)
            IDiscountHelper target = getTestObject();
            decimal total = 200;

            //Аct (акт)
            var discountedTotal = target.ApplyDiscount(total);

            //Аssert (утверждение)
            Assert.AreEqual(total * 0.9M, discountedTotal);
        }
    }
}