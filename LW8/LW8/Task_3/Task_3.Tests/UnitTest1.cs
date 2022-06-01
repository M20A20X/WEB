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
            //�rrange (�����������)
            IDiscountHelper target = getTestObject();
            decimal total = 200;

            //�ct (���)
            var discountedTotal = target.ApplyDiscount(total);

            //�ssert (�����������)
            Assert.AreEqual(total * 0.9M, discountedTotal);
        }
    }
}